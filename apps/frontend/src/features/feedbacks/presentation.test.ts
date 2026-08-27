import { strict as assert } from "node:assert"
import test from "node:test"

import {
  channelLabel,
  formatFeedbackDate,
  ratingLabel,
  statusLabel,
  statusToneClass,
} from "./presentation"

test("converte valores internos em labels legíveis", () => {
  assert.equal(channelLabel.GOOGLE, "Google")
  assert.equal(statusLabel.EM_ANALISE, "Em análise")
  assert.equal(ratingLabel(1), "1 estrela")
  assert.equal(ratingLabel(5), "5 estrelas")
})

test("formata datas de hoje e ontem de forma relativa", () => {
  const now = new Date(2026, 7, 27, 15, 0)

  assert.equal(formatFeedbackDate(new Date(2026, 7, 27, 12, 30), now), "Hoje às 12:30")
  assert.equal(formatFeedbackDate(new Date(2026, 7, 26, 9, 5), now), "Ontem às 09:05")
  assert.match(formatFeedbackDate(new Date(2026, 7, 20, 9, 5), now), /20 de ago\.? de 2026 às 09:05/)
})

test("associa cores semânticas aos status", () => {
  assert.match(statusToneClass.NOVO, /primary/)
  assert.match(statusToneClass.EM_ANALISE, /warning/)
  assert.match(statusToneClass.CONCLUIDO, /success/)
})
