import { LayoutDashboardIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import logo from "@/assets/logo.webp"
import logoExtended from "@/assets/logo-extended.webp"
import logoExtendedWhite from "@/assets/logo-extended-white.webp"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ThemePreference } from "@/lib/theme-state"

const themeLabels: Record<ThemePreference, string> = {
  system: "Sistema",
  light: "Claro",
  dark: "Escuro",
}

const themeIcons = {
  system: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
}

type FeedbackSidebarProps = {
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference) => void
}

export function FeedbackSidebar({ theme, onThemeChange }: FeedbackSidebarProps) {
  const ThemeIcon = themeIcons[theme]

  return <Sidebar collapsible="icon"><SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive size="lg" tooltip="Falaê" className="bg-transparent hover:bg-sidebar-accent data-active:bg-transparent"><img src={logoExtended} alt="Falaê" className="h-9 w-auto max-w-full object-contain dark:hidden group-data-[collapsible=icon]:hidden" /><img src={logoExtendedWhite} alt="Falaê" className="hidden h-9 w-auto max-w-full object-contain dark:block group-data-[collapsible=icon]:hidden" /><img src={logo} alt="" className="hidden h-8 w-auto object-contain group-data-[collapsible=icon]:block" /></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel>Navegação</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive tooltip="Feedbacks"><LayoutDashboardIcon /><span>Feedbacks</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent><SidebarFooter><SidebarMenu><SidebarMenuItem><Select value={theme} onValueChange={(value) => { if (value === "system" || value === "light" || value === "dark") onThemeChange(value) }}><SelectTrigger aria-label="Tema da aparência" className="w-full border-0 bg-transparent shadow-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:[&>svg:last-child]:hidden"><SelectValue className="group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center">{() => <><ThemeIcon /><span className="group-data-[collapsible=icon]:hidden">{themeLabels[theme]}</span></>}</SelectValue></SelectTrigger><SelectContent side="top" align="start"><SelectItem value="system"><MonitorIcon />Sistema</SelectItem><SelectItem value="light"><SunIcon />Claro</SelectItem><SelectItem value="dark"><MoonIcon />Escuro</SelectItem></SelectContent></Select></SidebarMenuItem></SidebarMenu></SidebarFooter><SidebarRail /></Sidebar>
}
