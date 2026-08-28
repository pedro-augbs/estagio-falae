import { strict as assert } from "node:assert"
import test from "node:test"

import {
  channelLabel,
  formatFeedbackDate,
  ratingLabel,
  statusLabel,
  statusTextClass,
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

  assert.equal(formatFeedbackDate(new Date(2026, 7, 27, 12, 30), now), "Hoje 12:30")
  assert.equal(formatFeedbackDate(new Date(2026, 7, 26, 9, 5), now), "Ontem 09:05")
  assert.equal(formatFeedbackDate(new Date(2026, 7, 20, 9, 5), now), "20 ago. 2026 09:05")
})

test("associa cores semânticas aos status", () => {
  assert.match(statusToneClass.NOVO, /bg-sky-100/)
  assert.match(statusToneClass.NOVO, /dark:bg-sky-400\/15/)
  assert.match(statusTextClass.NOVO, /dark:text-sky-300/)
  assert.match(statusToneClass.EM_ANALISE, /bg-amber-100/)
  assert.match(statusToneClass.EM_ANALISE, /dark:bg-amber-400\/15/)
  assert.match(statusTextClass.EM_ANALISE, /dark:text-amber-300/)
  assert.match(statusToneClass.CONCLUIDO, /bg-emerald-100/)
  assert.match(statusToneClass.CONCLUIDO, /dark:bg-emerald-400\/15/)
  assert.match(statusTextClass.CONCLUIDO, /dark:text-emerald-300/)
})
