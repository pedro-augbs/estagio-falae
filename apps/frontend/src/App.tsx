import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FeedbackFilters } from "@/features/feedbacks/components/feedback-filters"
import { FeedbackHeader } from "@/features/feedbacks/components/feedback-header"
import { FeedbackList } from "@/features/feedbacks/components/feedback-list"
import { FeedbackDetailsSheet } from "@/features/feedbacks/components/feedback-details-sheet"
import { FeedbackMetrics } from "@/features/feedbacks/components/feedback-metrics"
import { FeedbackSidebar } from "@/features/feedbacks/components/feedback-sidebar"
import { useState } from "react"
import { useEffect } from "react"
import { useFeedbacks } from "@/features/feedbacks/hooks/use-feedbacks"

const DESKTOP_QUERY = "(min-width: 1024px)"

export default function App() {
  const { data, metrics, filters, setFilters, clearFilters, loading, error, refetch } = useFeedbacks()
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const hasFilters = filters.search || filters.channel !== "ALL" || filters.status !== "ALL" || filters.rating !== "ALL"

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const syncSidebar = () => setSidebarOpen(mediaQuery.matches)

    mediaQuery.addEventListener("change", syncSidebar)
    return () => mediaQuery.removeEventListener("change", syncSidebar)
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <FeedbackSidebar />
        <SidebarInset>
          <FeedbackHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-10">
            <div className="flex flex-col gap-2"><p className="text-sm font-medium text-muted-foreground">Visão geral</p><h1 className="font-heading text-3xl font-semibold tracking-tight">Feedbacks</h1><p className="max-w-2xl text-sm leading-6 text-muted-foreground">Acompanhe a voz dos clientes em um só lugar.</p></div>
            <FeedbackMetrics total={data.length} metrics={metrics} />
            <FeedbackFilters filters={filters} onChange={setFilters} onClear={clearFilters} />
            <FeedbackList items={data} loading={loading} error={error} hasFilters={Boolean(hasFilters)} onClearFilters={clearFilters} onRetry={refetch} onSelect={setSelectedId} />
          </div>
        </SidebarInset>
        <FeedbackDetailsSheet id={selectedId} onOpenChange={(open) => { if (!open) setSelectedId(null) }} onUpdated={refetch} />
      </SidebarProvider>
    </TooltipProvider>
  )
}
