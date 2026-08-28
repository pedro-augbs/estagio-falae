import { useState } from "react"
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { channelLabel, ratingLabel, statusLabel, statusTextClass, statusToneClass } from "../presentation"
import type { FeedbackChannel, FeedbackFilters as FeedbackFiltersType, FeedbackStatus } from "../types"

type FeedbackFiltersProps = { filters: FeedbackFiltersType; onChange: (filters: FeedbackFiltersType) => void; onClear: () => void }

function FilterControls({ filters, onChange, onClear }: FeedbackFiltersProps) {
  const active = filters.search || filters.channel !== "ALL" || filters.status !== "ALL" || filters.rating !== "ALL"
  return <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"><div className="relative min-w-0 flex-1 sm:min-w-56"><SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Buscar feedbacks" className="w-full pl-9" placeholder="Buscar por cliente ou comentário" value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} /></div><Select value={filters.channel} onValueChange={(channel) => onChange({ ...filters, channel: channel as FeedbackFiltersType["channel"] })}><SelectTrigger aria-label="Filtrar por canal" className="w-full sm:w-36"><SelectValue>{(value) => channelLabel[value as FeedbackChannel] ?? "Canais"}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="ALL">Canais</SelectItem><SelectItem value="GOOGLE">{channelLabel.GOOGLE}</SelectItem><SelectItem value="IFOOD">{channelLabel.IFOOD}</SelectItem><SelectItem value="PESQUISA">{channelLabel.PESQUISA}</SelectItem></SelectGroup></SelectContent></Select><Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status: status as FeedbackFiltersType["status"] })}><SelectTrigger aria-label="Filtrar por status" className={cn("w-full sm:w-40", filters.status !== "ALL" && statusToneClass[filters.status as FeedbackStatus])}><SelectValue>{(value) => <span className={value && value !== "ALL" ? statusTextClass[value as FeedbackStatus] : ""}>{statusLabel[value as FeedbackStatus] ?? "Status"}</span>}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="ALL">Status</SelectItem>{(["NOVO", "EM_ANALISE", "CONCLUIDO"] as const).map((status) => <SelectItem key={status} value={status}><span className={statusTextClass[status]}>{statusLabel[status]}</span></SelectItem>)}</SelectGroup></SelectContent></Select><Select value={String(filters.rating)} onValueChange={(rating) => onChange({ ...filters, rating: rating === "ALL" ? "ALL" : Number(rating) })}><SelectTrigger aria-label="Filtrar por nota" className="w-full sm:w-32"><SelectValue>{(value) => value && value !== "ALL" ? ratingLabel(Number(value)) : "Nota"}</SelectValue></SelectTrigger><SelectContent><SelectGroup><SelectItem value="ALL">Nota</SelectItem>{[1, 2, 3, 4, 5].map((rating) => <SelectItem key={rating} value={String(rating)}>{ratingLabel(rating)}</SelectItem>)}</SelectGroup></SelectContent></Select>{active ? <Button variant="ghost" onClick={onClear} aria-label="Limpar filtros"><XIcon data-icon="inline-start" />Limpar</Button> : null}</div>
}

export function FeedbackFilters({ filters, onChange, onClear }: FeedbackFiltersProps) {
  const [open, setOpen] = useState(false)

  const clearSheetFilters = () => {
    onClear()
    setOpen(false)
  }

  return <><section className="hidden rounded-xl border bg-card p-3 md:block" aria-label="Filtros"><FilterControls filters={filters} onChange={onChange} onClear={onClear} /></section><div className="md:hidden"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger render={<Button variant="outline"><SlidersHorizontalIcon data-icon="inline-start" />Filtros</Button>} /><SheetContent className="!w-full overflow-y-auto sm:max-w-sm"><SheetHeader><SheetTitle>Filtros</SheetTitle><SheetDescription>Refine a lista de feedbacks por cliente, canal, status ou nota.</SheetDescription></SheetHeader><div className="flex flex-1 flex-col gap-4 px-4 pb-4"><FilterControls filters={filters} onChange={onChange} onClear={clearSheetFilters} /></div></SheetContent></Sheet></div></>
}
