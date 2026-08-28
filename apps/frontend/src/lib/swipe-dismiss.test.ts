import assert from "node:assert/strict"
import test from "node:test"

import { shouldDismissSwipe } from "./swipe-dismiss"

test("fecha apenas com arraste horizontal suficiente para a direita", () => {
  assert.equal(shouldDismissSwipe(120, 12), true)
  assert.equal(shouldDismissSwipe(95, 0), false)
  assert.equal(shouldDismissSwipe(-120, 0), false)
})

test("não fecha quando o movimento é predominantemente vertical", () => {
  assert.equal(shouldDismissSwipe(120, 140), false)
})
