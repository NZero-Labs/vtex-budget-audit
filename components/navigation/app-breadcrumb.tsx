"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labels: Record<string, string> = {
  tools: "Ferramentas",
  "budget-audit": "Auditoria de Orçamentos",
  cart: "Orçamento vs Carrinho",
  budgets: "Orçamento vs Orçamento",
};

export function AppBreadcrumb() {
  const parts = usePathname().split("/").filter(Boolean);

  return (
    <Breadcrumb className="min-w-0 overflow-hidden">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {parts.map((part, index) => {
          const href = `/${parts.slice(0, index + 1).join("/")}`;
          const last = index === parts.length - 1;
          return (
            <BreadcrumbItem key={href} className="min-w-0">
              {index > 0 && <BreadcrumbSeparator />}
              {last ? (
                <BreadcrumbPage className="block max-w-[42vw] truncate sm:max-w-none">
                  {labels[part] ?? part}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link className="hidden truncate sm:inline" href={href}>
                    {labels[part] ?? part}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
