export function readSidebarPreference(cookie: string): boolean | undefined {
  const value = cookie
    .split(";")
    .map((part) => part.trim().split("=", 2))
    .find(([name]) => name === "sidebar_state")?.[1]

  return value === "true" ? true : value === "false" ? false : undefined
}
