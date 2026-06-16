import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppBreadcrumb } from "@/components/navigation/app-breadcrumb";
import { ToolCommandMenu } from "@/components/navigation/tool-command-menu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 min-w-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur-xl sm:gap-3 sm:px-4">
          <SidebarTrigger className="shrink-0" />
          <Separator orientation="vertical" className="h-4" />
          <div className="min-w-0 flex-1">
            <AppBreadcrumb />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ToolCommandMenu />
            <ThemeToggle />
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-4 md:px-6 lg:px-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
