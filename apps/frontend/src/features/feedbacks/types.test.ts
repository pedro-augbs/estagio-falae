import assert from "node:assert/strict"
import test from "node:test"

import { MAX_NOTE_LENGTH, toQuery, type FeedbackFilters } from "./types"

test("limite de anotacao e 500 caracteres", () => {
  assert.equal(MAX_NOTE_LENGTH, 500)
})

test("toQuery combina somente os filtros ativos", () => {
  const filters: FeedbackFilters = {
    search: "atendimento",
    channel: "GOOGLE",
    status: "NOVO",
    rating: 2,
  }

  assert.equal(
    toQuery(filters),
    "search=atendimento&channel=GOOGLE&status=NOVO&rating=2",
  )
})

test("toQuery omite filtros no valor ALL", () => {
  const filters: FeedbackFilters = {
    search: "",
    channel: "ALL",
    status: "ALL",
    rating: "ALL",
  }

  assert.equal(toQuery(filters), "")
})
