import assert from "node:assert/strict"
import test from "node:test"

import { createNote, fetchFeedback, fetchNotes, updateStatus } from "./api"

test("createNote envia a descricao limpa e retorna a anotacao criada", async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "http://localhost:3333/api/feedbacks/f1/notes")
    assert.equal(init?.method, "POST")
    assert.equal(init?.body, JSON.stringify({ description: "Contato feito" }))
    return Response.json({ id: "n1", feedbackId: "f1", description: "Contato feito", createdAt: "2026-08-26T12:00:00.000Z" }, { status: 201 })
  }

  const note = await createNote("f1", "Contato feito")

  assert.equal(note.description, "Contato feito")
})

test("updateStatus preserva a mensagem do envelope de erro", async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async () => Response.json({ error: { message: "Adicione uma anotacao antes de concluir." } }, { status: 409 })

  await assert.rejects(updateStatus("f1", "CONCLUIDO"), (error: Error) => error.message === "Adicione uma anotacao antes de concluir.")
})

test("requisições de detalhe recebem o sinal de cancelamento", async (t) => {
  const originalFetch = globalThis.fetch
  const controller = new AbortController()
  const signals: AbortSignal[] = []
  t.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async (_input, init) => {
    signals.push(init?.signal as AbortSignal)
    return Response.json([])
  }

  await Promise.all([fetchFeedback("f1", controller.signal), fetchNotes("f1", controller.signal)])

  assert.deepEqual(signals, [controller.signal, controller.signal])
})

test("mutações aceitam e encaminham o sinal de cancelamento", async (t) => {
  const originalFetch = globalThis.fetch
  const controller = new AbortController()
  const signals: AbortSignal[] = []
  t.after(() => { globalThis.fetch = originalFetch })

  globalThis.fetch = async (_input, init) => {
    signals.push(init?.signal as AbortSignal)
    return Response.json({ id: "item", feedbackId: "f1", description: "Nota", createdAt: "2026-08-26T12:00:00.000Z", customerName: "Cliente", rating: 4, comment: null, channel: "GOOGLE", status: "CONCLUIDO" })
  }

  await createNote("f1", "Nota", controller.signal)
  await updateStatus("f1", "CONCLUIDO", controller.signal)

  assert.deepEqual(signals, [controller.signal, controller.signal])
})
