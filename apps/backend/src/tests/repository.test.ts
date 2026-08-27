import assert from "node:assert/strict";
import test from "node:test";

import { PrismaFeedbackRepository } from "../modules/feedbacks/repository.js";
import {
  FeedbackChannel,
  FeedbackStatus,
  type FeedbackNoteRecord,
  type FeedbackRecord
} from "../modules/feedbacks/types.js";

function makeFeedback(): FeedbackRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    customerName: "Ana",
    rating: 2,
    comment: "Atendimento lento",
    channel: FeedbackChannel.GOOGLE,
    status: FeedbackStatus.EM_ANALISE,
    createdAt: new Date("2026-08-26T12:00:00.000Z")
  };
}

function makeNote(): FeedbackNoteRecord {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    feedbackId: "11111111-1111-4111-8111-111111111111",
    description: "Contato realizado",
    createdAt: new Date("2026-08-26T12:00:00.000Z")
  };
}

function makePrismaFake(findMany: (args: unknown) => Promise<FeedbackRecord[]>) {
  return {
    feedback: {
      findMany,
      findUnique: async () => null,
      update: async () => makeFeedback()
    },
    feedbackNote: {
      findMany: async () => [],
      count: async () => 0,
      create: async () => makeNote()
    }
  };
}

test("list monta filtros combinados, busca textual e ordenacao no delegate Prisma", async () => {
  let receivedArgs: unknown;
  const feedback = makeFeedback();
  const repository = new PrismaFeedbackRepository(
    makePrismaFake(async (args) => {
      receivedArgs = args;
      return [feedback];
    })
  );

  const result = await repository.list({
    channel: FeedbackChannel.GOOGLE,
    status: FeedbackStatus.EM_ANALISE,
    rating: 2,
    search: "Ana"
  });

  assert.deepEqual(result, [feedback]);
  assert.deepEqual(receivedArgs, {
    where: {
      AND: [
        { channel: FeedbackChannel.GOOGLE },
        { status: FeedbackStatus.EM_ANALISE },
        { rating: 2 },
        {
          OR: [
            { customerName: { contains: "Ana" } },
            { comment: { contains: "Ana" } }
          ]
        }
      ]
    },
    orderBy: { createdAt: "desc" }
  });
});

test("list preserva resultado vazio e ordenacao quando nao ha filtros", async () => {
  let receivedArgs: unknown;
  const repository = new PrismaFeedbackRepository(
    makePrismaFake(async (args) => {
      receivedArgs = args;
      return [];
    })
  );

  const result = await repository.list({});

  assert.deepEqual(result, []);
  assert.deepEqual(receivedArgs, {
    where: { AND: [] },
    orderBy: { createdAt: "desc" }
  });
});
