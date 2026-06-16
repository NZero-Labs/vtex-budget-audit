import type { LucideIcon } from "lucide-react";
import { FileSpreadsheet, ScanSearch } from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category?: string;
  enabled: boolean;
}

export const tools = [
  {
    id: "budget-audit",
    name: "Auditoria de Orçamentos",
    description: "Compare orçamentos, carrinhos, preços, promoções, frete e peso em uma visão operacional.",
    icon: ScanSearch,
    href: "/tools/budget-audit",
    category: "Operações comerciais",
    enabled: true,
  },
  {
    id: "spreadsheet-validation",
    name: "Validação de Planilhas",
    description: "Valide CSVs de integradores e corrija o campo de cupom no Master Data com progresso auditável.",
    icon: FileSpreadsheet,
    href: "/tools/spreadsheet-validation",
    category: "Operações comerciais",
    enabled: true,
  },
] as const satisfies readonly Tool[];

export const enabledTools = tools.filter((tool) => tool.enabled);
