import Image from "next/image";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from '@/components/admin/appsidebar'
import Maps from "./maps/page";

export default function Home( { children } ) {
  const position = { lat: 55.67594, lng: 12.56553 }; // Example position (CPH)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <SidebarTrigger />
        { children }
        <Maps />  
      </main>
      </SidebarProvider>
    </div>
  );
}
