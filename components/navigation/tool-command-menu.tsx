"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { enabledTools } from "@/config/tools.config";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";

export function ToolCommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button variant="outline" className="hidden w-56 justify-start text-muted-foreground sm:flex" onClick={() => setOpen(true)}>
        <Search /> Buscar ferramenta <kbd className="ml-auto text-[10px]">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setOpen(true)} aria-label="Buscar ferramenta"><Search /></Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar ferramentas e ações..." />
        <CommandList>
          <CommandEmpty>Nenhuma ferramenta encontrada.</CommandEmpty>
          <CommandGroup heading="Ferramentas">
            {enabledTools.map((tool) => <CommandItem key={tool.id} onSelect={() => navigate(tool.href)}><tool.icon />{tool.name}<CommandShortcut>abrir</CommandShortcut></CommandItem>)}
          </CommandGroup>
          <CommandGroup heading="Auditoria">
            <CommandItem onSelect={() => navigate("/tools/budget-audit/cart")}>Orçamento vs Carrinho</CommandItem>
            <CommandItem onSelect={() => navigate("/tools/budget-audit/budgets")}>Orçamento vs Orçamento</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
