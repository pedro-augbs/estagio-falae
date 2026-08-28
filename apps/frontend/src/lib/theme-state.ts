export type ThemePreference = "system" | "light" | "dark"
export type EffectiveTheme = Exclude<ThemePreference, "system">

export const THEME_STORAGE_KEY = "falae-theme"

export function readThemePreference(value: string | null): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system"
}

export function getEffectiveTheme(preference: ThemePreference, systemDark: boolean): EffectiveTheme {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference
}
