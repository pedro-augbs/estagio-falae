import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import { join } from "node:path";
import test from "node:test";

import { getNpmInvocation, prepareDevEnvironment } from "../dev-setup.js";

async function makeBackendDirectory(withDatabase: boolean) {
  const backendDir = await mkdtemp(join(os.tmpdir(), "falae-dev-setup-"));
  await mkdir(join(backendDir, "prisma"));
  await writeFile(join(backendDir, ".env.example"), "DATABASE_URL=\"file:./dev.db\"\n", "utf8");

  if (withDatabase) {
    await writeFile(join(backendDir, "prisma", "dev.db"), "", "utf8");
  }

  return backendDir;
}

test("prepara o ambiente e faz seed quando o banco ainda nao existe", async () => {
  const backendDir = await makeBackendDirectory(false);
  const commands: string[] = [];

  try {
    const result = await prepareDevEnvironment(backendDir, async (command) => {
      commands.push(command);
    });

    assert.equal(result.seeded, true);
    assert.deepEqual(commands, ["db:generate", "db:migrate:deploy", "db:seed"]);
    await access(join(backendDir, ".env"));
  } finally {
    await rm(backendDir, { recursive: true, force: true });
  }
});

test("preserva banco existente e nao faz seed ao iniciar novamente", async () => {
  const backendDir = await makeBackendDirectory(true);
  const commands: string[] = [];

  try {
    const result = await prepareDevEnvironment(backendDir, async (command) => {
      commands.push(command);
    });

    assert.equal(result.seeded, false);
    assert.deepEqual(commands, ["db:generate", "db:migrate:deploy"]);
  } finally {
    await rm(backendDir, { recursive: true, force: true });
  }
});

test("usa cmd para executar scripts npm no Windows", () => {
  assert.deepEqual(getNpmInvocation("db:generate", "win32"), {
    command: "cmd.exe",
    args: ["/d", "/s", "/c", "npm run db:generate"]
  });
});
