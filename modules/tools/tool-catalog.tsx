"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { tools } from "@/config/tools.config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";

export function ToolCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = ["Todas", ...new Set(tools.map((tool) => tool.category).filter(Boolean))] as string[];
  const filtered = useMemo(() => tools.filter((tool) => {
    const matchesQuery = `${tool.name} ${tool.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "Todas" || tool.category === category);
  }), [category, query]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
      <section className="surface-grid relative overflow-hidden rounded-2xl border bg-card px-4 py-8 shadow-sm sm:rounded-3xl sm:px-6 sm:py-10 md:px-10 md:py-14">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/8" />
        <div className="relative max-w-3xl space-y-3 sm:space-y-4">
          <Badge variant="secondary" className="gap-1.5"><Sparkles className="size-3" /> Workspace operacional</Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-5xl">Ferramentas VTEX, em um só lugar.</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">Acesse utilitários internos para investigar divergências e acelerar decisões operacionais com menos troca de contexto.</p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-xl font-semibold tracking-tight">Catálogo</h2><p className="text-sm text-muted-foreground">{tools.filter((tool) => tool.enabled).length} ferramenta disponível</p></div>
          <div className="relative w-full lg:w-80"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ferramenta..." className="pl-9" /></div>
        </div>
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">{categories.map((item) => <Button key={item} size="sm" className="shrink-0" variant={category === item ? "default" : "outline"} onClick={() => setCategory(item)}>{item}</Button>)}</div>
        {filtered.length === 0 ? (
          <Empty className="min-h-72 border"><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>Nenhuma ferramenta encontrada</EmptyTitle><EmptyDescription>Ajuste a busca ou selecione outra categoria.</EmptyDescription></EmptyHeader></Empty>
        ) : (
          <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((tool) => {
            const content = <Card className="group h-full transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><CardHeader><div className="mb-3 flex min-w-0 items-start justify-between gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><tool.icon className="size-5" /></div><Badge className="shrink-0" variant={tool.enabled ? "secondary" : "outline"}>{tool.enabled ? "Disponível" : "Em breve"}</Badge></div><CardTitle>{tool.name}</CardTitle><CardDescription className="sm:min-h-10">{tool.description}</CardDescription></CardHeader><CardContent><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{tool.category}</span></CardContent><CardFooter className="border-t bg-muted/20 pt-4 text-sm font-medium">{tool.enabled ? <>Abrir ferramenta <ArrowUpRight className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></> : "Disponível em uma próxima versão"}</CardFooter></Card>;
            return tool.enabled ? <Link key={tool.id} href={tool.href}>{content}</Link> : <div key={tool.id} aria-disabled>{content}</div>;
          })}</div>
        )}
      </section>
    </div>
  );
}
