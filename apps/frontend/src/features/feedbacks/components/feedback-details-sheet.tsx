import { useEffect, useRef, useState, type FormEvent } from "react"
import { AlertCircleIcon, CheckCircle2Icon, StarIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createNote, fetchFeedback, fetchNotes, updateStatus } from "../api"
import { channelLabel, formatFeedbackDate, statusLabel, statusTextClass, statusToneClass } from "../presentation"
import type { Feedback, FeedbackNote, FeedbackStatus } from "../types"

const statuses: FeedbackStatus[] = ["NOVO", "EM_ANALISE", "CONCLUIDO"]

function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() }

type FeedbackDetailsSheetProps = { id: string | null; onOpenChange: (open: boolean) => void; onUpdated: () => void }

export function FeedbackDetailsSheet({ id, onOpenChange, onUpdated }: FeedbackDetailsSheetProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [notes, setNotes] = useState<FeedbackNote[]>([])
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [submittingNote, setSubmittingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const currentIdRef = useRef(id)
  const noteControllerRef = useRef<AbortController | null>(null)
  const statusControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    currentIdRef.current = id
    noteControllerRef.current?.abort()
    statusControllerRef.current?.abort()
    setNote("")
    setSubmittingNote(false)
    setUpdatingStatus(false)
    setLoading(Boolean(id))
    setError(null)
    setSuccess(null)
    setFeedback(null)
    setNotes([])
    if (!id) return
    const controller = new AbortController()
    void Promise.all([fetchFeedback(id, controller.signal), fetchNotes(id, controller.signal)]).then(([detail, detailNotes]) => {
      if (!controller.signal.aborted) { setFeedback(detail); setNotes(detailNotes) }
    }).catch((reason) => {
      if (controller.signal.aborted || (reason instanceof Error && reason.name === "AbortError")) return
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar o feedback.")
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => {
      controller.abort()
      noteControllerRef.current?.abort()
      statusControllerRef.current?.abort()
    }
  }, [id])

  async function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const description = note.trim()
    if (!id || !description) return
    const requestId = id
    const controller = new AbortController()
    noteControllerRef.current = controller
    setSubmittingNote(true); setError(null); setSuccess(null)
    try {
      const created = await createNote(requestId, description, controller.signal)
      if (controller.signal.aborted || currentIdRef.current !== requestId) return
      setNotes((current) => [created, ...current]); setNote(""); setSuccess("Anotação adicionada.")
    } catch (reason) {
      if (controller.signal.aborted || currentIdRef.current !== requestId || (reason instanceof Error && reason.name === "AbortError")) return
      setError(reason instanceof Error ? reason.message : "Não foi possível adicionar a anotação.")
    } finally {
      if (!controller.signal.aborted && currentIdRef.current === requestId) setSubmittingNote(false)
      if (noteControllerRef.current === controller) noteControllerRef.current = null
    }
  }

  async function changeStatus(status: string | null) {
    if (!id || !feedback || !statuses.includes(status as FeedbackStatus)) return
    const requestId = id
    const controller = new AbortController()
    statusControllerRef.current = controller
    setUpdatingStatus(true); setError(null); setSuccess(null)
    try {
      const updated = await updateStatus(requestId, status as FeedbackStatus, controller.signal)
      if (controller.signal.aborted || currentIdRef.current !== requestId) return
      setFeedback(updated); setSuccess("Status atualizado."); onUpdated()
    } catch (reason) {
      if (controller.signal.aborted || currentIdRef.current !== requestId || (reason instanceof Error && reason.name === "AbortError")) return
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o status.")
    } finally {
      if (!controller.signal.aborted && currentIdRef.current === requestId) setUpdatingStatus(false)
      if (statusControllerRef.current === controller) statusControllerRef.current = null
    }
  }

  return <Sheet open={Boolean(id)} onOpenChange={onOpenChange}><SheetContent className="w-full sm:max-w-lg overflow-y-auto"><SheetHeader><SheetTitle>Detalhes do feedback</SheetTitle><SheetDescription>Consulte o atendimento, registre anotações internas e atualize o status.</SheetDescription></SheetHeader><div className="flex flex-1 flex-col gap-5 px-4 pb-4">{loading ? <><Skeleton className="h-24 w-full" /><Skeleton className="h-20 w-full" /></> : null}{error ? <Alert variant="destructive"><AlertCircleIcon /><AlertTitle>Não foi possível concluir a ação</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}{feedback ? <><section className="flex items-start gap-3" aria-label="Dados do feedback"><Avatar><AvatarFallback>{initials(feedback.customerName)}</AvatarFallback></Avatar><div className="min-w-0"><p className="font-medium">{feedback.customerName}</p><p className="text-sm text-muted-foreground">{formatFeedbackDate(feedback.createdAt)}</p><div className="mt-2 flex flex-wrap gap-1"><Badge variant="secondary">{channelLabel[feedback.channel]}</Badge><Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning-foreground"><StarIcon className="size-3 fill-warning text-warning" aria-hidden="true" />{feedback.rating}</Badge></div></div></section><section className="space-y-2"><Label>Comentário do cliente</Label><p className="rounded-lg border bg-muted/30 p-3 text-sm">{feedback.comment ?? "Cliente não deixou comentário."}</p></section><section className="space-y-2"><Label htmlFor="feedback-status">Status</Label><Select value={feedback.status} onValueChange={changeStatus} disabled={updatingStatus}><SelectTrigger id="feedback-status" className={cn("w-full", statusToneClass[feedback.status])} aria-label="Status do feedback"><SelectValue>{(value) => <span className={value ? statusTextClass[value as FeedbackStatus] : ""}>{statusLabel[value as FeedbackStatus] ?? "Status"}</span>}</SelectValue></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}><span className={statusTextClass[status]}>{statusLabel[status]}</span></SelectItem>)}</SelectContent></Select>{updatingStatus ? <p className="text-sm text-muted-foreground">Atualizando status…</p> : null}</section><section className="space-y-3"><div><Label>Anotações internas</Label><p className="text-sm text-muted-foreground">{notes.length ? "Mais recentes primeiro." : "Nenhuma anotação registrada."}</p></div>{notes.map((item) => <div key={item.id} className="rounded-lg border p-3"><p className="text-sm">{item.description}</p><p className="mt-2 text-xs text-muted-foreground">{formatFeedbackDate(item.createdAt)}</p></div>)}</section><form className="space-y-3" onSubmit={submitNote}><Label htmlFor="new-note">Nova anotação</Label><Textarea id="new-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registre o próximo passo ou retorno ao cliente" disabled={submittingNote} /><Button className="w-full" type="submit" disabled={submittingNote || !note.trim()}>{submittingNote ? "Salvando…" : "Adicionar anotação"}</Button>{success ? <Alert><CheckCircle2Icon /><AlertTitle>Ação concluída</AlertTitle><AlertDescription>{success}</AlertDescription></Alert> : null}</form></> : null}</div></SheetContent></Sheet>
}
