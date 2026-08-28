import {
  FeedbackChannel as PrismaFeedbackChannel,
  FeedbackStatus as PrismaFeedbackStatus
} from "@prisma/client";

export const FeedbackChannel = PrismaFeedbackChannel;
export type FeedbackChannel = PrismaFeedbackChannel;

export const FeedbackStatus = PrismaFeedbackStatus;
export type FeedbackStatus = PrismaFeedbackStatus;

export const MAX_NOTE_LENGTH = 500;

export type FeedbackRecord = {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  channel: FeedbackChannel;
  status: FeedbackStatus;
  createdAt: Date;
};

export type FeedbackNoteRecord = {
  id: string;
  feedbackId: string;
  description: string;
  createdAt: Date;
};

export type FeedbackFilters = {
  channel?: FeedbackChannel;
  status?: FeedbackStatus;
  rating?: number;
  search?: string;
};

export type FeedbackMetrics = {
  averageRating: number;
  positive: number;
  critical: number;
};

export type FeedbackListResponse = {
  items: FeedbackRecord[];
  total: number;
  metrics: FeedbackMetrics;
};

export interface FeedbackRepository {
  list(filters: FeedbackFilters): Promise<FeedbackRecord[]>;
  findById(id: string): Promise<FeedbackRecord | null>;
  listNotes(feedbackId: string): Promise<FeedbackNoteRecord[]>;
  countNotes(feedbackId: string): Promise<number>;
  createNote(feedbackId: string, description: string): Promise<FeedbackNoteRecord>;
  updateStatus(id: string, status: FeedbackStatus): Promise<FeedbackRecord>;
}
