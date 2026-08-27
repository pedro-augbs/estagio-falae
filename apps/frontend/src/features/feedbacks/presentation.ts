import type { FeedbackChannel, FeedbackStatus } from "./types"

export const channelLabel: Record<FeedbackChannel, string> = {
  GOOGLE: "Google",
  IFOOD: "iFood",
  PESQUISA: "Pesquisa",
}

export const statusLabel: Record<FeedbackStatus, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  CONCLUIDO: "Concluído",
}

export const statusToneClass: Record<FeedbackStatus, string> = {
  NOVO: "border-primary/25 bg-primary/10 text-primary",
  EM_ANALISE: "border-warning/30 bg-warning/15 text-warning-foreground",
  CONCLUIDO: "border-success/30 bg-success/15 text-success-foreground",
}

export const statusTextClass: Record<FeedbackStatus, string> = {
  NOVO: "text-primary",
  EM_ANALISE: "text-warning-foreground",
  CONCLUIDO: "text-success-foreground",
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" })
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" })

export function ratingLabel(rating: number) {
  return `${rating} estrela${rating > 1 ? "s" : ""}`
}

export function formatFeedbackDate(value: string | Date, now = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponível"

  const daysAgo = Math.round((calendarDay(now) - calendarDay(date)) / 86_400_000)
  const label = daysAgo === 0 ? "Hoje" : daysAgo === 1 ? "Ontem" : dateFormatter.format(date)
  return `${label} às ${timeFormatter.format(date)}`
}

function calendarDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}
