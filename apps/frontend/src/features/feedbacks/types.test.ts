import assert from "node:assert/strict"
import test from "node:test"

import { toQuery, type FeedbackFilters } from "./types"

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
