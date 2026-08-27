import { toQuery, type Feedback, type FeedbackFilters, type FeedbackListResponse, type FeedbackNote, type FeedbackStatus } from "./types"

const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3333"

export async function fetchFeedbacks(filters: FeedbackFilters, signal?: AbortSignal): Promise<FeedbackListResponse> {
  const query = toQuery(filters)
  return request<FeedbackListResponse>(`/api/feedbacks${query ? `?${query}` : ""}`, { signal })
}

export function fetchFeedback(id: string, signal?: AbortSignal) { return request<Feedback>(`/api/feedbacks/${id}`, { signal }) }
export function fetchNotes(id: string, signal?: AbortSignal) { return request<FeedbackNote[]>(`/api/feedbacks/${id}/notes`, { signal }) }
export function createNote(id: string, description: string, signal?: AbortSignal) { return request<FeedbackNote>(`/api/feedbacks/${id}/notes`, { method: "POST", body: JSON.stringify({ description }), headers: { "Content-Type": "application/json" }, signal }) }
export function updateStatus(id: string, status: FeedbackStatus, signal?: AbortSignal) { return request<Feedback>(`/api/feedbacks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }), headers: { "Content-Type": "application/json" }, signal }) }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? "Não foi possível concluir a solicitação. Tente novamente.")
  }
  return response.json() as Promise<T>
}
