"use client";

/**
 * Página principal de comparação Budget vs OrderForm
 * Design System: Amara NZero
 */

import { useState } from "react";
import {
  InputForm,
  SummaryCards,
  ItemDiffTable,
  PromoDiffs,
  ShippingDiffs,
  DiffLegend,
} from "./components";
import { ComparisonResult, ApiError } from "@/lib/compare/types";
import { Button } from "@/components/ui/Button";

type ViewState = "input" | "loading" | "result" | "error";

export default function ComparePage() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const handleSubmit = async (data: {
    orderFormUrl: string;
    idBudget: string;
  }) => {
    setViewState("loading");
    setError(null);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json as ApiError);
        setViewState("error");
        return;
      }

      setResult(json as ComparisonResult);
      setViewState("result");
    } catch (err) {
      setError({
        error: "NETWORK_ERROR",
        message: "Erro de conexão. Verifique sua internet e tente novamente.",
        details: err instanceof Error ? err.message : "Erro desconhecido",
      });
      setViewState("error");
    }
  };

  const handleReset = () => {
    setViewState("input");
    setResult(null);
    setError(null);
  };

  const handleExportCSV = () => {
    if (!result) return;

    const lines: string[] = [];

    // Header
    lines.push("VTEX Budget Audit - Relatório de Comparação");
    lines.push(
      `Data: ${new Date(result.metadata.comparedAt).toLocaleString("pt-BR")}`,
    );
    lines.push(`OrderForm ID: ${result.metadata.orderFormId}`);
    lines.push(`Budget ID: ${result.metadata.budgetId}`);
    lines.push("");

    // Resumo
    lines.push("=== RESUMO ===");
    lines.push(`Total de divergências: ${result.summary.totalDiffs}`);
    lines.push(`Divergências críticas: ${result.summary.criticalDiffs}`);
    lines.push(
      `Impacto financeiro: R$ ${result.summary.financialImpact.toFixed(2)}`,
    );
    lines.push("");

    // Totais
    lines.push("=== TOTAIS ===");
    lines.push("Campo,Orçamento,Carrinho,Diferença");
    lines.push(
      `Subtotal,${result.totalsDiff.subtotal.budget.toFixed(2)},${result.totalsDiff.subtotal.cart.toFixed(2)},${result.totalsDiff.subtotal.diff.toFixed(2)}`,
    );
    lines.push(
      `Descontos,${result.totalsDiff.discounts.budget.toFixed(2)},${result.totalsDiff.discounts.cart.toFixed(2)},${result.totalsDiff.discounts.diff.toFixed(2)}`,
    );
    lines.push(
      `Frete,${result.totalsDiff.shipping.budget.toFixed(2)},${result.totalsDiff.shipping.cart.toFixed(2)},${result.totalsDiff.shipping.diff.toFixed(2)}`,
    );
    lines.push(
      `Total,${result.totalsDiff.total.budget.toFixed(2)},${result.totalsDiff.total.cart.toFixed(2)},${result.totalsDiff.total.diff.toFixed(2)}`,
    );
    lines.push("");

    // Itens
    lines.push("=== ITENS ===");
    lines.push("SKU,Nome,Qtd Orç,Qtd Cart,Preço Orç,Preço Cart,Status,Impacto");
    for (const item of result.itemDiffs) {
      lines.push(
        `${item.skuId},"${item.name}",${item.budgetQty ?? ""},${item.cartQty ?? ""},${item.budgetPrice?.toFixed(2) ?? ""},${item.cartPrice?.toFixed(2) ?? ""},${item.status},${item.impact}`,
      );
    }

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comparacao_${result.metadata.orderFormId}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header da página */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comparar Orçamento vs Carrinho
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
            Cole o link do carrinho VTEX e o ID do orçamento para comparar
          </p>
        </div>

        {viewState === "result" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              Exportar CSV
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Nova Comparação
            </Button>
          </div>
        )}
      </div>

      {/* Formulário de entrada */}
      {(viewState === "input" || viewState === "loading") && (
        <InputForm
          onSubmit={handleSubmit}
          isLoading={viewState === "loading"}
        />
      )}

      {/* Estado de erro */}
      {viewState === "error" && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
            Erro na Comparação
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {error.message}
          </p>
          {error.details !== undefined && (
            <pre className="bg-red-100 dark:bg-red-900/40 p-3 rounded-md text-sm text-red-700 dark:text-red-300 overflow-x-auto">
              {typeof error.details === "string"
                ? error.details
                : JSON.stringify(error.details as object, null, 2)}
            </pre>
          )}
          {error.requestId && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Request ID: {error.requestId}
            </p>
          )}
          <div className="mt-6">
            <Button onClick={handleReset}>Tentar Novamente</Button>
          </div>
        </div>
      )}

      {/* Resultado da comparação */}
      {viewState === "result" && result && (
        <div className="space-y-8">
          {/* Cards de resumo */}
          <SummaryCards
            summary={result.summary}
            totalsDiff={result.totalsDiff}
          />

          {/* Tabela de itens */}
          <ItemDiffTable itemDiffs={result.itemDiffs} />

          {/* Promoções */}
          {result.promoDiffs.length > 0 && (
            <PromoDiffs promoDiffs={result.promoDiffs} />
          )}

          {/* Entrega */}
          <ShippingDiffs shippingDiff={result.shippingDiff} />

          {/* Legenda */}
          <DiffLegend />

          {/* Metadados */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Comparação realizada em{" "}
            {new Date(result.metadata.comparedAt).toLocaleString("pt-BR")}
            {" | "}Request ID: {result.metadata.requestId}
          </div>
        </div>
      )}
    </div>
  );
}
