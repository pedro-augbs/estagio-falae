import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type DevSetupCommand = (script: string) => void;

type DevSetupResult = {
  seeded: boolean;
};

const defaultBackendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function getNpmInvocation(script: string, platform = process.platform) {
  return platform === "win32"
    ? { command: "cmd.exe", args: ["/d", "/s", "/c", `npm run ${script}`] }
    : { command: "npm", args: ["run", script] };
}

function runNpmScript(script: string, backendDir: string) {
  const { command, args } = getNpmInvocation(script);
  execFileSync(command, args, {
    cwd: backendDir,
    stdio: "inherit"
  });
}

export function prepareDevEnvironment(
  backendDir = defaultBackendDir,
  runCommand: DevSetupCommand = (script) => runNpmScript(script, backendDir)
): DevSetupResult {
  const envPath = resolve(backendDir, ".env");
  const databasePath = resolve(backendDir, "prisma", "dev.db");
  const shouldSeed = !existsSync(databasePath);

  if (!existsSync(envPath)) {
    copyFileSync(resolve(backendDir, ".env.example"), envPath);
  }

  runCommand("db:generate");
  runCommand("db:migrate:deploy");

  if (shouldSeed) {
    runCommand("db:seed");
  }

  return { seeded: shouldSeed };
}
