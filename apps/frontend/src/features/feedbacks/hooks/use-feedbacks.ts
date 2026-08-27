import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react"

import { fetchFeedbacks } from "../api"
import { defaultFeedbackFilters, type FeedbackFilters, type FeedbackListResponse, type FeedbackMetrics } from "../types"

const emptyMetrics: FeedbackMetrics = { averageRating: 0, positive: 0, critical: 0 }

type UseFeedbacksResult = {
  data: FeedbackListResponse["items"]
  metrics: FeedbackMetrics
  filters: FeedbackFilters
  setFilters: Dispatch<SetStateAction<FeedbackFilters>>
  clearFilters: () => void
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFeedbacks(): UseFeedbacksResult {
  const [filters, setFilters] = useState(defaultFeedbackFilters)
  const [data, setData] = useState<FeedbackListResponse["items"]>([])
  const [metrics, setMetrics] = useState(emptyMetrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchFeedbacks(filters, controller.signal)
        setData(response.items)
        setMetrics(response.metrics)
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError") return
        setError(reason instanceof Error ? reason.message : "Não foi possível carregar os feedbacks.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [filters, request])

  const refetch = useCallback(() => setRequest((value) => value + 1), [])
  const clearFilters = useCallback(() => { setFilters(defaultFeedbackFilters); refetch() }, [refetch])
  return { data, metrics, filters, setFilters, clearFilters, loading, error, refetch }
}
