import { AlertCircleIcon, StarIcon } from "lucide-react"
import type { KeyboardEvent } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { channelLabel, formatFeedbackDate, statusLabel, statusToneClass } from "../presentation"
import type { Feedback } from "../types"

function initials(name: string) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() }
function FeedbackIdentity({ feedback }: { feedback: Feedback }) { return <div className="flex min-w-0 items-center gap-3"><Avatar><AvatarFallback>{initials(feedback.customerName)}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-medium">{feedback.customerName}</p>{feedback.comment ? <p className="truncate text-sm text-muted-foreground">{feedback.comment}</p> : null}</div></div> }
function Rating({ rating }: { rating: number }) { return <span className="inline-flex items-center gap-1 font-medium tabular-nums"><StarIcon className="size-4 fill-warning text-warning" aria-hidden="true" />{rating}</span> }
function FeedbackBadges({ feedback }: { feedback: Feedback }) { return <div className="flex flex-wrap gap-1"><Badge variant="secondary">{channelLabel[feedback.channel]}</Badge><Badge variant="outline" className={statusToneClass[feedback.status]}>{statusLabel[feedback.status]}</Badge></div> }
function FeedbackListSkeleton() { return <div className="flex flex-col gap-3">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-20 w-full" />)}</div> }

type FeedbackListProps = { items: Feedback[]; loading: boolean; error: string | null; hasFilters: boolean; onClearFilters: () => void; onRetry: () => void; onSelect: (id: string) => void }

export function FeedbackList({ items, loading, error, hasFilters, onClearFilters, onRetry, onSelect }: FeedbackListProps) {
  if (loading) return <FeedbackListSkeleton />
  if (error) return <Alert variant="destructive"><AlertCircleIcon /><AlertTitle>Não foi possível carregar a lista</AlertTitle><AlertDescription>{error} <Button variant="outline" size="sm" onClick={onRetry}>Tentar novamente</Button></AlertDescription></Alert>
  if (!items.length) return <Card><CardHeader><CardTitle>Nenhum feedback encontrado</CardTitle><CardDescription>{hasFilters ? "Ajuste ou limpe os filtros para ver outros resultados." : "Quando houver respostas de clientes, elas aparecerão aqui."}</CardDescription></CardHeader>{hasFilters ? <CardContent><Button variant="outline" onClick={onClearFilters}>Limpar filtros</Button></CardContent> : null}</Card>
  const activate = (id: string, event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(id) } }
  return <><div className="hidden rounded-xl border md:block"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Nota</TableHead><TableHead>Canal e status</TableHead><TableHead className="text-right">Data</TableHead></TableRow></TableHeader><TableBody>{items.map((feedback) => <TableRow key={feedback.id}><TableCell className="max-w-md p-0"><Button variant="ghost" className="h-auto w-full justify-start p-4 text-left hover:bg-muted/50" aria-label={`Abrir feedback de ${feedback.customerName}`} onClick={() => onSelect(feedback.id)}><FeedbackIdentity feedback={feedback} /></Button></TableCell><TableCell><Rating rating={feedback.rating} /></TableCell><TableCell><FeedbackBadges feedback={feedback} /></TableCell><TableCell className="text-right text-muted-foreground">{formatFeedbackDate(feedback.createdAt)}</TableCell></TableRow>)}</TableBody></Table></div><div className="flex flex-col gap-3 md:hidden">{items.map((feedback) => <Card key={feedback.id} size="sm" tabIndex={0} role="button" aria-label={`Abrir feedback de ${feedback.customerName}`} className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onSelect(feedback.id)} onKeyDown={(event) => activate(feedback.id, event)}><CardHeader><FeedbackIdentity feedback={feedback} /></CardHeader><CardContent className="flex flex-wrap items-center justify-between gap-3"><Rating rating={feedback.rating} /><FeedbackBadges feedback={feedback} /><span className="text-xs text-muted-foreground">{formatFeedbackDate(feedback.createdAt)}</span></CardContent></Card>)}</div></>
}
