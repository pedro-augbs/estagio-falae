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
  NOVO: "border-sky-600/30 bg-sky-100 text-sky-800 dark:border-sky-400/40 dark:bg-sky-400/15 dark:text-sky-300",
  EM_ANALISE: "border-amber-600/30 bg-amber-100 text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-300",
  CONCLUIDO: "border-emerald-600/30 bg-emerald-100 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-300",
}

export const statusTextClass: Record<FeedbackStatus, string> = {
  NOVO: "text-sky-800 dark:text-sky-300",
  EM_ANALISE: "text-amber-900 dark:text-amber-300",
  CONCLUIDO: "text-emerald-800 dark:text-emerald-300",
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
  const label = daysAgo === 0 ? "Hoje" : daysAgo === 1 ? "Ontem" : dateFormatter.format(date).replaceAll(" de ", " ")
  return `${label} ${timeFormatter.format(date)}`
}

function calendarDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}
