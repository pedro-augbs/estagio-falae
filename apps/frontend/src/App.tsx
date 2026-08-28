import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FeedbackFilters } from "@/features/feedbacks/components/feedback-filters"
import { FeedbackHeader } from "@/features/feedbacks/components/feedback-header"
import { FeedbackList } from "@/features/feedbacks/components/feedback-list"
import { FeedbackDetailsSheet } from "@/features/feedbacks/components/feedback-details-sheet"
import { FeedbackMetrics } from "@/features/feedbacks/components/feedback-metrics"
import { FeedbackSidebar } from "@/features/feedbacks/components/feedback-sidebar"
import { readSidebarPreference } from "@/lib/sidebar-state"
import { getEffectiveTheme, readThemePreference, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme-state"
import { useEffect, useLayoutEffect, useState } from "react"
import { useFeedbacks } from "@/features/feedbacks/hooks/use-feedbacks"

const DESKTOP_QUERY = "(min-width: 1024px)"

export default function App() {
  const { data, metrics, filters, setFilters, clearFilters, loading, error, refetch } = useFeedbacks()
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    readSidebarPreference(document.cookie) ?? window.matchMedia(DESKTOP_QUERY).matches
  )
  const [theme, setTheme] = useState<ThemePreference>(() =>
    readThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY))
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const hasFilters = filters.search || filters.channel !== "ALL" || filters.status !== "ALL" || filters.rating !== "ALL"

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const applyTheme = (systemDark: boolean) => {
      const effectiveTheme = getEffectiveTheme(theme, systemDark)
      document.documentElement.classList.toggle("dark", effectiveTheme === "dark")
      document.documentElement.style.colorScheme = effectiveTheme
    }
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (theme === "system") applyTheme(event.matches)
    }

    applyTheme(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const syncSidebar = () => setSidebarOpen(mediaQuery.matches)

    mediaQuery.addEventListener("change", syncSidebar)
    return () => mediaQuery.removeEventListener("change", syncSidebar)
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <FeedbackSidebar theme={theme} onThemeChange={setTheme} />
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
