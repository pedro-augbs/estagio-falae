import { LayoutDashboardIcon } from "lucide-react"

import logo from "@/assets/logo.webp"
import logoExtended from "@/assets/logo-extended.webp"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

export function FeedbackSidebar() {
  return <Sidebar collapsible="icon"><SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive size="lg" tooltip="Falaê" className="bg-transparent hover:bg-sidebar-accent data-active:bg-transparent"><img src={logoExtended} alt="Falaê" className="h-9 w-auto max-w-full object-contain group-data-[collapsible=icon]:hidden" /><img src={logo} alt="" className="hidden h-8 w-auto object-contain group-data-[collapsible=icon]:block" /></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel>Navegação</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive tooltip="Feedbacks"><LayoutDashboardIcon /><span>Feedbacks</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent><SidebarFooter /><SidebarRail /></Sidebar>
}
