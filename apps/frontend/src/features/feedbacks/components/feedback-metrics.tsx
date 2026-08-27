import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FeedbackMetrics as FeedbackMetricsType } from "../types"

export function FeedbackMetrics({ total, metrics }: { total: number; metrics: FeedbackMetricsType }) {
  const items = [["Total", total, "feedbacks encontrados"], ["Média", metrics.averageRating.toFixed(1), "nota média"], ["Positivos", metrics.positive, "notas 4 e 5"], ["Críticos", metrics.critical, "notas 1 e 2"]]
  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas dos feedbacks">{items.map(([label, value, description]) => <Card key={label} size="sm"><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-2xl tabular-nums">{value}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">{description}</CardContent></Card>)}</section>
}
