import { SidebarTrigger } from "@/components/ui/sidebar"
import { getHeaderTitle } from "../route-title"

export function FeedbackHeader() {
  return <header className="relative sticky top-0 z-10 flex h-14 shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 lg:px-10"><SidebarTrigger className="absolute left-2" /><span className="text-sm font-medium text-muted-foreground">{getHeaderTitle(window.location.pathname)}</span></header>
}
