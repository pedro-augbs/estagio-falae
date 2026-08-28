import assert from "node:assert/strict"
import test from "node:test"

import { getEffectiveTheme, readThemePreference } from "./theme-state"

test("usa sistema como padrão e ignora preferências inválidas", () => {
  assert.equal(readThemePreference(null), "system")
  assert.equal(readThemePreference("light"), "light")
  assert.equal(readThemePreference("dark"), "dark")
  assert.equal(readThemePreference("invalid"), "system")
})

test("resolve o tema efetivo a partir da preferência do sistema", () => {
  assert.equal(getEffectiveTheme("light", true), "light")
  assert.equal(getEffectiveTheme("dark", false), "dark")
  assert.equal(getEffectiveTheme("system", true), "dark")
  assert.equal(getEffectiveTheme("system", false), "light")
})
