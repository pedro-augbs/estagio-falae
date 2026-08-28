export type FeedbackChannel = "GOOGLE" | "IFOOD" | "PESQUISA"
export type FeedbackStatus = "NOVO" | "EM_ANALISE" | "CONCLUIDO"

export type FeedbackFilters = {
  search: string
  channel: "ALL" | FeedbackChannel
  status: "ALL" | FeedbackStatus
  rating: "ALL" | number
}

export type Feedback = {
  id: string
  customerName: string
  rating: number
  comment: string | null
  channel: FeedbackChannel
  status: FeedbackStatus
  createdAt: string
}

export type FeedbackNote = {
  id: string
  feedbackId: string
  description: string
  createdAt: string
}

export const MAX_NOTE_LENGTH = 500

export type FeedbackMetrics = { averageRating: number; positive: number; critical: number }
export type FeedbackListResponse = { items: Feedback[]; total: number; metrics: FeedbackMetrics }

export const defaultFeedbackFilters: FeedbackFilters = { search: "", channel: "ALL", status: "ALL", rating: "ALL" }

export function toQuery(filters: FeedbackFilters) {
  const query = new URLSearchParams()
  if (filters.search) query.set("search", filters.search)
  if (filters.channel !== "ALL") query.set("channel", filters.channel)
  if (filters.status !== "ALL") query.set("status", filters.status)
  if (filters.rating !== "ALL") query.set("rating", String(filters.rating))
  return query.toString()
}
