import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import ItemLink from "../shared/itemlink"
import { Separator } from "@/components/ui/separator"

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader >
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        </SidebarHeader>
      <SidebarContent>
        <div className="flex max-w-md flex-col gap-4">
        <ItemLink title="Dashboard" href="/admin/dashboard" />

        <ItemLink title="Brugere" href="/admin/users" />

        <ItemLink title="Virksomheder" href="/admin/companies" description="H管理 virksomheder" status="Klar" />

        <ItemLink title="Anmodninger" href="/admin/requests" />

        <ItemLink title="Statistik" href="/admin/statistics" />

        <ItemLink title="Docs" href="/admin/settings" />
        <SidebarGroup />
        <SidebarGroup />
        </div>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}