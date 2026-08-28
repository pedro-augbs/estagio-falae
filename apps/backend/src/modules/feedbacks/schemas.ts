import { FeedbackChannel, FeedbackStatus, MAX_NOTE_LENGTH } from "./types.js";

const feedbackProperties = {
  id: { type: "string" },
  customerName: { type: "string" },
  rating: { type: "integer" },
  comment: { type: ["string", "null"] },
  channel: { type: "string", enum: Object.values(FeedbackChannel) },
  status: { type: "string", enum: Object.values(FeedbackStatus) },
  createdAt: { type: "string", format: "date-time" }
} as const;

const noteProperties = {
  id: { type: "string" },
  feedbackId: { type: "string" },
  description: { type: "string" },
  createdAt: { type: "string", format: "date-time" }
} as const;

export const feedbackParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" }
  }
} as const;

export const feedbackListQuerySchema = {
  type: "object",
  properties: {
    channel: { type: "string", enum: Object.values(FeedbackChannel) },
    status: { type: "string", enum: Object.values(FeedbackStatus) },
    rating: { type: "integer", minimum: 1, maximum: 5 },
    search: { type: "string", minLength: 1 }
  }
} as const;

export const createFeedbackNoteBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["description"],
  properties: {
    description: { type: "string", maxLength: MAX_NOTE_LENGTH }
  }
} as const;

export const updateFeedbackStatusBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["status"],
  properties: {
    status: { type: "string", enum: Object.values(FeedbackStatus) }
  }
} as const;

export const feedbackSchema = {
  type: "object",
  properties: feedbackProperties,
  required: ["id", "customerName", "rating", "comment", "channel", "status", "createdAt"]
} as const;

export const feedbackNoteSchema = {
  type: "object",
  properties: noteProperties,
  required: ["id", "feedbackId", "description", "createdAt"]
} as const;

export const feedbackListResponseSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: feedbackSchema
    },
    total: { type: "integer" },
    metrics: {
      type: "object",
      properties: {
        averageRating: { type: "number" },
        positive: { type: "integer" },
        critical: { type: "integer" }
      },
      required: ["averageRating", "positive", "critical"]
    }
  },
  required: ["items", "total", "metrics"]
} as const;
