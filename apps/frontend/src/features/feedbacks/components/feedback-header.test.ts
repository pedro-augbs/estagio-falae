import assert from "node:assert/strict"
import test from "node:test"

import { getHeaderTitle } from "../route-title"

test("usa títulos diferentes conforme a rota", () => {
  assert.equal(getHeaderTitle("/"), "Feedbacks")
  assert.equal(getHeaderTitle("/feedbacks"), "Feedbacks")
  assert.equal(getHeaderTitle("/feedbacks/feedback-id"), "Detalhes do feedback")
})
