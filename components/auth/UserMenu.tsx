"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function UserMenu() {
  const { data: session, status } = useSession();
  const { isMobile } = useSidebar();
  if (status === "loading") return <Skeleton className="h-10 w-full" />;
  if (!session?.user) return null;

  const initials = session.user.name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg bg-primary text-primary-foreground">{initials}</AvatarFallback></Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">{session.user.name}</span><span className="truncate text-xs text-muted-foreground">{session.user.email}</span></div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="w-56">
            <DropdownMenuLabel>{session.user.role === "ADMIN" ? "Administrador" : "Usuário"}</DropdownMenuLabel>
            {session.user.role === "ADMIN" && <><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/admin"><Settings2 /> Administração</Link></DropdownMenuItem></>}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}><LogOut /> Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
