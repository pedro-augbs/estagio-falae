import assert from "node:assert/strict";
import test from "node:test";

import { buildApp } from "../app.js";
import { FeedbackService } from "../modules/feedbacks/service.js";
import type {
  FeedbackListResponse,
  FeedbackNoteRecord,
  FeedbackRecord,
  FeedbackRepository
} from "../modules/feedbacks/types.js";

const validFeedbackId = "11111111-1111-4111-8111-111111111111";

function makeFeedback(overrides: Partial<FeedbackRecord> = {}): FeedbackRecord {
  return {
    id: "critical",
    customerName: "Cliente teste",
    rating: 2,
    comment: "Atendimento lento",
    channel: "GOOGLE",
    status: "EM_ANALISE",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  };
}

function makeNote(overrides: Partial<FeedbackNoteRecord> = {}): FeedbackNoteRecord {
  return {
    id: "note",
    feedbackId: "critical",
    description: "Contato realizado",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  };
}

function makeRepository(overrides: Partial<FeedbackRepository> = {}): FeedbackRepository {
  const feedback = makeFeedback();
  const note = makeNote({ feedbackId: feedback.id });

  return {
    list: async () => [feedback],
    findById: async () => feedback,
    listNotes: async () => [note],
    countNotes: async () => 1,
    createNote: async (feedbackId, description) => makeNote({ feedbackId, description }),
    updateStatus: async (_id, status) => ({ ...feedback, status }),
    ...overrides
  };
}

async function buildTestApp(repositoryOverrides: Partial<FeedbackRepository> = {}) {
  const app = buildApp({
    service: new FeedbackService(makeRepository(repositoryOverrides))
  });

  await app.ready();

  return app;
}

test("recusa concluir feedback critico sem anotacao", async () => {
  const service = new FeedbackService(makeRepository({ countNotes: async () => 0 }));

  await assert.rejects(
    service.changeStatus("critical", "CONCLUIDO"),
    (error: Error) => error.message.includes("pelo menos uma anotacao")
  );
});

test("permite concluir feedback critico com anotacao", async () => {
  const service = new FeedbackService(makeRepository());

  const result = await service.changeStatus("critical", "CONCLUIDO");

  assert.equal(result.status, "CONCLUIDO");
});

test("recusa descricao vazia ao adicionar anotacao", async () => {
  const service = new FeedbackService(makeRepository());

  await assert.rejects(service.addNote("critical", ""), (error: Error) =>
    error.message.includes("obrigatoria")
  );
});

test("recusa descricao com apenas espacos ao adicionar anotacao", async () => {
  const service = new FeedbackService(makeRepository());

  await assert.rejects(service.addNote("critical", "   "), (error: Error) =>
    error.message.includes("obrigatoria")
  );
});

test("remove espacos nas pontas antes de salvar anotacao", async () => {
  let savedDescription = "";
  const service = new FeedbackService(
    makeRepository({
      createNote: async (feedbackId, description) => {
        savedDescription = description;
        return makeNote({ feedbackId, description });
      }
    })
  );

  const note = await service.addNote("critical", "  retorno enviado  ");

  assert.equal(savedDescription, "retorno enviado");
  assert.equal(note.description, "retorno enviado");
});

test("falha quando feedback nao existe ao buscar detalhes", async () => {
  const service = new FeedbackService(makeRepository({ findById: async () => null }));

  await assert.rejects(service.get("missing"), (error: Error) => error.message.includes("nao encontrado"));
});

test("falha quando feedback nao existe ao listar anotacoes", async () => {
  const service = new FeedbackService(makeRepository({ findById: async () => null }));

  await assert.rejects(service.getNotes("missing"), (error: Error) =>
    error.message.includes("nao encontrado")
  );
});

test("falha quando feedback nao existe ao adicionar anotacao", async () => {
  const service = new FeedbackService(makeRepository({ findById: async () => null }));

  await assert.rejects(service.addNote("missing", "nota"), (error: Error) =>
    error.message.includes("nao encontrado")
  );
});

test("falha quando feedback nao existe ao mudar status", async () => {
  const service = new FeedbackService(makeRepository({ findById: async () => null }));

  await assert.rejects(service.changeStatus("missing", "EM_ANALISE"), (error: Error) =>
    error.message.includes("nao encontrado")
  );
});

test("recusa status invalido", async () => {
  const service = new FeedbackService(makeRepository());

  await assert.rejects(service.changeStatus("critical", "INVALIDO" as never), (error: Error) =>
    error.message.includes("invalido")
  );
});

test("calcula metricas por rating de 1 a 5", async () => {
  const items = [
    makeFeedback({ id: "1", rating: 1 }),
    makeFeedback({ id: "2", rating: 2 }),
    makeFeedback({ id: "3", rating: 3 }),
    makeFeedback({ id: "4", rating: 4 }),
    makeFeedback({ id: "5", rating: 5 })
  ];
  const service = new FeedbackService(makeRepository({ list: async () => items }));

  const result = await service.list({});

  assert.deepEqual(result, {
    items,
    total: 5,
    metrics: {
      averageRating: 3,
      critical: 2,
      positive: 2
    }
  } satisfies FeedbackListResponse);
});

test("GET /health responde com status ok", async (t) => {
  const app = await buildTestApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/health"
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
});

test("GET /api/feedbacks aplica filtros combinados e retorna metricas filtradas", async (t) => {
  let receivedFilters: unknown;
  const items = [
    makeFeedback({ id: "1", rating: 2, customerName: "Ana", comment: "lento" }),
    makeFeedback({ id: "2", rating: 4, customerName: "Bia", comment: "otimo" })
  ];
  const app = await buildTestApp({
    list: async (filters) => {
      receivedFilters = filters;
      return items;
    }
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/feedbacks?channel=GOOGLE&status=EM_ANALISE&rating=2&search=ana"
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual({ ...receivedFilters as Record<string, unknown> }, {
    channel: "GOOGLE",
    status: "EM_ANALISE",
    rating: 2,
    search: "ana"
  });
  assert.deepEqual(response.json(), {
    items: items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString()
    })),
    total: 2,
    metrics: {
      averageRating: 3,
      positive: 1,
      critical: 1
    }
  });
});

test("GET /api/feedbacks/:id retorna detalhes", async (t) => {
  const feedback = makeFeedback({ id: validFeedbackId });
  const app = await buildTestApp({
    findById: async (id) => (id === feedback.id ? feedback : null)
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: `/api/feedbacks/${feedback.id}`
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    ...feedback,
    createdAt: feedback.createdAt.toISOString()
  });
});

test("GET /api/feedbacks/:id/notes retorna notas", async (t) => {
  const feedback = makeFeedback({ id: validFeedbackId });
  const notes = [makeNote({ id: "n1", feedbackId: feedback.id })];
  const app = await buildTestApp({
    findById: async (id) => (id === feedback.id ? feedback : null),
    listNotes: async () => notes
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: `/api/feedbacks/${feedback.id}/notes`
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), [
    {
      ...notes[0],
      createdAt: notes[0].createdAt.toISOString()
    }
  ]);
});

test("POST /api/feedbacks/:id/notes cria anotacao com 201", async (t) => {
  const feedback = makeFeedback({ id: validFeedbackId });
  const note = makeNote({ feedbackId: feedback.id, description: "Retorno enviado" });
  const app = await buildTestApp({
    findById: async (id) => (id === feedback.id ? feedback : null),
    createNote: async (_feedbackId, description) => makeNote({ feedbackId: feedback.id, description })
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: `/api/feedbacks/${feedback.id}/notes`,
    payload: { description: note.description }
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), {
    ...note,
    createdAt: note.createdAt.toISOString()
  });
});

test("PATCH /api/feedbacks/:id/status altera status com 200", async (t) => {
  const feedback = makeFeedback({ id: validFeedbackId, rating: 5 });
  const app = await buildTestApp({
    findById: async (id) => (id === feedback.id ? feedback : null),
    updateStatus: async (_id, status) => ({ ...feedback, status })
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "PATCH",
    url: `/api/feedbacks/${feedback.id}/status`,
    payload: { status: "CONCLUIDO" }
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    ...feedback,
    status: "CONCLUIDO",
    createdAt: feedback.createdAt.toISOString()
  });
});

test("CORS permite preflight de PATCH para troca de status", async (t) => {
  const app = await buildTestApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "OPTIONS",
    url: `/api/feedbacks/${validFeedbackId}/status`,
    headers: {
      origin: "http://localhost:5173",
      "access-control-request-method": "PATCH",
      "access-control-request-headers": "content-type"
    }
  });

  assert.equal(response.statusCode, 204);
  assert.match(response.headers["access-control-allow-methods"] ?? "", /PATCH/);
});

test("retorna 400 com envelope consistente para input invalido", async (t) => {
  const app = await buildTestApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: `/api/feedbacks/${validFeedbackId}/notes`,
    payload: {
      description: "nota",
      extra: true
    }
  });

  assert.equal(response.statusCode, 400);
  const payload = response.json();

  assert.equal(payload.error.code, "VALIDATION_ERROR");
  assert.match(payload.error.message, /body/i);
});

test("retorna 400 com envelope consistente para UUID invalido", async (t) => {
  const app = await buildTestApp();

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/feedbacks/not-a-uuid"
  });

  assert.equal(response.statusCode, 400);
  const payload = response.json();

  assert.equal(payload.error.code, "VALIDATION_ERROR");
  assert.match(payload.error.message, /uuid/i);
});

test("retorna 404 com envelope consistente quando feedback nao existe", async (t) => {
  const app = await buildTestApp({
    findById: async () => null
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "GET",
    url: `/api/feedbacks/${validFeedbackId}`
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), {
    error: {
      code: "NOT_FOUND",
      message: "Feedback nao encontrado"
    }
  });
});

test("retorna 409 com envelope consistente para regra critica", async (t) => {
  const app = await buildTestApp({
    countNotes: async () => 0
  });

  t.after(async () => {
    await app.close();
  });

  const response = await app.inject({
    method: "PATCH",
    url: `/api/feedbacks/${validFeedbackId}/status`,
    payload: { status: "CONCLUIDO" }
  });

  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.json(), {
    error: {
      code: "CRITICAL_FEEDBACK_REQUIRES_NOTE",
      message: "Feedback critico precisa de pelo menos uma anotacao antes de concluir"
    }
  });
});
