import { Badge as BaseBadge } from "@/components/ui/badge";
import type { ImpactLevel, ItemDiffStatus } from "@/lib/compare/types";
import { cn } from "@/lib/utils";

const tones = {
  default: "",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
};
export function Badge({
  children,
  variant = "default",
  className,
}: React.PropsWithChildren<{
  variant?: keyof typeof tones;
  className?: string;
}>) {
  return (
    <BaseBadge variant="outline" className={cn(tones[variant], className)}>
      {children}
    </BaseBadge>
  );
}
const impacts: Record<ImpactLevel, [string, keyof typeof tones]> = {
  none: ["OK", "success"],
  low: ["Baixo", "info"],
  medium: ["Médio", "warning"],
  high: ["Alto", "error"],
  critical: ["Crítico", "error"],
};
export function ImpactBadge({
  impact,
  className,
}: {
  impact: ImpactLevel;
  className?: string;
}) {
  const [label, variant] = impacts[impact];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
const statuses: Record<ItemDiffStatus, [string, keyof typeof tones]> = {
  match: ["Igual", "success"],
  quantity_diff: ["Qtd diferente", "warning"],
  price_diff: ["Preço diferente", "warning"],
  quantity_price_diff: ["Qtd e preço", "error"],
  missing_in_cart: ["Falta no carrinho", "error"],
  unexpected_in_cart: ["Extra no carrinho", "error"],
};
export function StatusBadge({
  status,
  className,
}: {
  status: ItemDiffStatus;
  className?: string;
}) {
  const [label, variant] = statuses[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
