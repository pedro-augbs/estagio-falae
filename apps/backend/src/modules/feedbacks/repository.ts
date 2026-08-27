import type { Prisma } from "@prisma/client";

import { prisma } from "../../shared/prisma.js";
import type {
  FeedbackFilters,
  FeedbackNoteRecord,
  FeedbackRecord,
  FeedbackRepository,
  FeedbackStatus
} from "./types.js";

type PrismaFeedbackClient = {
  feedback: {
    findMany(args: {
      where: Prisma.FeedbackWhereInput;
      orderBy: { createdAt: "desc" };
    }): Promise<FeedbackRecord[]>;
    findUnique(args: { where: { id: string } }): Promise<FeedbackRecord | null>;
    update(args: {
      where: { id: string };
      data: { status: FeedbackStatus };
    }): Promise<FeedbackRecord>;
  };
  feedbackNote: {
    findMany(args: {
      where: { feedbackId: string };
      orderBy: { createdAt: "desc" };
    }): Promise<FeedbackNoteRecord[]>;
    count(args: { where: { feedbackId: string } }): Promise<number>;
    create(args: {
      data: { feedbackId: string; description: string };
    }): Promise<FeedbackNoteRecord>;
  };
};

export class PrismaFeedbackRepository implements FeedbackRepository {
  constructor(private readonly client: PrismaFeedbackClient = prisma) {}

  async list(filters: FeedbackFilters): Promise<FeedbackRecord[]> {
    const { channel, status, rating, search } = filters;
    const andFilters: Prisma.FeedbackWhereInput[] = [];

    if (channel) andFilters.push({ channel });
    if (status) andFilters.push({ status });
    if (rating !== undefined) andFilters.push({ rating });
    if (search) {
      andFilters.push({
        OR: [
          { customerName: { contains: search } },
          { comment: { contains: search } }
        ]
      });
    }

    return this.client.feedback.findMany({
      where: {
        AND: andFilters
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findById(id: string): Promise<FeedbackRecord | null> {
    return this.client.feedback.findUnique({ where: { id } });
  }

  async listNotes(feedbackId: string): Promise<FeedbackNoteRecord[]> {
    return this.client.feedbackNote.findMany({
      where: { feedbackId },
      orderBy: { createdAt: "desc" }
    });
  }

  async countNotes(feedbackId: string): Promise<number> {
    return this.client.feedbackNote.count({ where: { feedbackId } });
  }

  async createNote(feedbackId: string, description: string): Promise<FeedbackNoteRecord> {
    return this.client.feedbackNote.create({
      data: {
        feedbackId,
        description
      }
    });
  }

  async updateStatus(id: string, status: FeedbackStatus): Promise<FeedbackRecord> {
    return this.client.feedback.update({
      where: { id },
      data: { status }
    });
  }
}
