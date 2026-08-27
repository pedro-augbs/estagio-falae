import assert from "node:assert/strict"
import test from "node:test"

import { readSidebarPreference } from "./sidebar-state"

test("lê a preferência da sidebar no cookie", () => {
  assert.equal(readSidebarPreference("sidebar_state=true"), true)
  assert.equal(readSidebarPreference("other=value; sidebar_state=false"), false)
  assert.equal(readSidebarPreference("other=value"), undefined)
})
