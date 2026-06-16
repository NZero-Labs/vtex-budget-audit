import Link from "next/link";
import { ArrowRight, Scale, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const comparisons = [
  { title: "Orçamento vs Carrinho", description: "Valide um orçamento do Master Data contra um OrderForm ativo.", href: "/tools/budget-audit/cart", icon: ShoppingCart },
  { title: "Orçamento vs Orçamento", description: "Compare preços, quantidades, promoções, frete e peso entre dois orçamentos.", href: "/tools/budget-audit/budgets", icon: Scale },
];

export function BudgetAuditHome() {
  return <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8"><div className="space-y-3"><Badge>Operações comerciais</Badge><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Auditoria de Orçamentos</h1><p className="max-w-2xl text-sm text-muted-foreground sm:text-base">Identifique divergências comerciais com comparações orientadas por impacto e dados vindos diretamente da VTEX.</p></div><div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">{comparisons.map((item) => <Link className="min-w-0" href={item.href} key={item.href}><Card className="group h-full transition hover:border-primary/50 hover:shadow-lg"><CardHeader><div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon /></div><CardTitle>{item.title}</CardTitle><CardDescription>{item.description}</CardDescription></CardHeader><CardFooter className="font-medium text-primary">Iniciar comparação <ArrowRight className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-1" /></CardFooter></Card></Link>)}</div></div>;
}
