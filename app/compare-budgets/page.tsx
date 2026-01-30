'use client';

/**
 * Página de comparação Budget vs Budget
 * Design System: Amara NZero
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  BudgetInputForm,
  BudgetComparisonSummaryCards,
  BudgetDiffTable,
  WeightSummary,
  PriceBreakdown,
} from './components';
import { PromoDiffs } from '@/app/compare/components/PromoDiffs';
import { ShippingDiffs } from '@/app/compare/components/ShippingDiffs';
import { DiffLegend } from '@/app/compare/components/DiffLegend';
import { BudgetComparisonResult, ApiError } from '@/lib/compare/types';
import { Button } from '@/components/ui/Button';

type ViewState = 'input' | 'loading' | 'result' | 'error';

export default function CompareBudgetsPage() {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [result, setResult] = useState<BudgetComparisonResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const handleSubmit = async (data: { idBudget1: string; idBudget2: string }) => {
    setViewState('loading');
    setError(null);

    try {
      const response = await fetch('/api/compare-budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json as ApiError);
        setViewState('error');
        return;
      }

      setResult(json as BudgetComparisonResult);
      setViewState('result');
    } catch (err) {
      setError({
        error: 'NETWORK_ERROR',
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        details: err instanceof Error ? err.message : 'Erro desconhecido',
      });
      setViewState('error');
    }
  };

  const handleReset = () => {
    setViewState('input');
    setResult(null);
    setError(null);
  };

  const handleExportCSV = () => {
    if (!result) return;

    const lines: string[] = [];

    // Header
    lines.push('VTEX Budget Audit - Comparação de Orçamentos');
    lines.push(`Data: ${new Date(result.metadata.comparedAt).toLocaleString('pt-BR')}`);
    lines.push(`Orçamento 1: ${result.metadata.budget1Id}`);
    lines.push(`Orçamento 2: ${result.metadata.budget2Id}`);
    lines.push('');

    // Resumo
    lines.push('=== RESUMO ===');
    lines.push(`Total de divergências: ${result.summary.totalDiffs}`);
    lines.push(`Divergências críticas: ${result.summary.criticalDiffs}`);
    lines.push(`Diferença financeira: R$ ${result.summary.financialDifference.toFixed(2)}`);
    lines.push(`Orçamento mais barato: ${result.priceAnalysis.cheaperBudget === 'equal' ? 'Iguais' : result.priceAnalysis.cheaperBudget === 'budget1' ? 'Orçamento 1' : 'Orçamento 2'}`);
    lines.push('');

    // Peso
    lines.push('=== PESO ===');
    lines.push(`Peso Orçamento 1: ${result.weightInfo.budget1.totalWeight.toFixed(2)} kg`);
    lines.push(`Peso Orçamento 2: ${result.weightInfo.budget2.totalWeight.toFixed(2)} kg`);
    lines.push(`Diferença de peso: ${result.weightInfo.difference.toFixed(2)} kg`);
    lines.push('');

    // Totais
    lines.push('=== TOTAIS ===');
    lines.push('Campo,Orçamento 1,Orçamento 2,Diferença');
    lines.push(`Subtotal,${result.totalsDiff.subtotal.budget1.toFixed(2)},${result.totalsDiff.subtotal.budget2.toFixed(2)},${result.totalsDiff.subtotal.diff.toFixed(2)}`);
    lines.push(`Descontos,${result.totalsDiff.discounts.budget1.toFixed(2)},${result.totalsDiff.discounts.budget2.toFixed(2)},${result.totalsDiff.discounts.diff.toFixed(2)}`);
    lines.push(`Frete,${result.totalsDiff.shipping.budget1.toFixed(2)},${result.totalsDiff.shipping.budget2.toFixed(2)},${result.totalsDiff.shipping.diff.toFixed(2)}`);
    lines.push(`Total,${result.totalsDiff.total.budget1.toFixed(2)},${result.totalsDiff.total.budget2.toFixed(2)},${result.totalsDiff.total.diff.toFixed(2)}`);
    lines.push('');

    // Itens
    lines.push('=== ITENS ===');
    lines.push('SKU,Nome,Qtd Orç1,Qtd Orç2,Preço Orç1,Preço Orç2,Peso Unit (kg),Status,Impacto');
    for (const item of result.itemDiffs) {
      lines.push(
        `${item.skuId},"${item.name}",${item.budget1Qty ?? ''},${item.budget2Qty ?? ''},${item.budget1Price?.toFixed(2) ?? ''},${item.budget2Price?.toFixed(2) ?? ''},${item.unitWeight.toFixed(2)},${item.status},${item.impact}`
      );
    }

    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparacao_budgets_${result.metadata.budget1Id}_${result.metadata.budget2Id}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header da página */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/home" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Comparar Orçamento vs Orçamento
            </h2>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Compare dois orçamentos para identificar diferenças de preços, quantidades e peso
          </p>
        </div>

        {viewState === 'result' && (
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
      {(viewState === 'input' || viewState === 'loading') && (
        <BudgetInputForm
          onSubmit={handleSubmit}
          isLoading={viewState === 'loading'}
        />
      )}

      {/* Estado de erro */}
      {viewState === 'error' && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
            Erro na Comparação
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {error.message}
          </p>
          {error.details !== undefined && (
            <pre className="bg-red-100 dark:bg-red-900/40 p-3 rounded-md text-sm text-red-700 dark:text-red-300 overflow-x-auto">
              {typeof error.details === 'string'
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
      {viewState === 'result' && result && (
        <div className="space-y-8">
          {/* Cards de resumo */}
          <BudgetComparisonSummaryCards
            summary={result.summary}
            totalsDiff={result.totalsDiff}
            priceAnalysis={result.priceAnalysis}
          />

          {/* Peso total */}
          <WeightSummary weightInfo={result.weightInfo} />

          {/* Análise de preço */}
          <PriceBreakdown priceAnalysis={result.priceAnalysis} />

          {/* Tabela de itens */}
          <BudgetDiffTable itemDiffs={result.itemDiffs} />

          {/* Promoções */}
          {result.promoDiffs.length > 0 && (
            <PromoDiffs 
              promoDiffs={result.promoDiffs} 
              labels={{ left: 'Orçamento 1', right: 'Orçamento 2' }}
            />
          )}

          {/* Entrega */}
          <ShippingDiffs 
            shippingDiff={result.shippingDiff} 
            labels={{ left: 'Orçamento 1', right: 'Orçamento 2' }}
          />

          {/* Legenda */}
          <DiffLegend />

          {/* Metadados */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Comparação realizada em {new Date(result.metadata.comparedAt).toLocaleString('pt-BR')}
            {' | '}Request ID: {result.metadata.requestId}
          </div>
        </div>
      )}
    </div>
  );
}
