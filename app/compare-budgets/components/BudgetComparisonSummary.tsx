'use client';

/**
 * Cards de resumo da comparação Budget vs Budget
 * Design System Amara NZero
 */

import { Card } from '@/components/ui/Card';
import { ImpactBadge } from '@/components/ui/Badge';
import { BudgetComparisonSummary, BudgetTotalsDiff, PriceAnalysis } from '@/lib/compare/types';
import { formatBRL } from '@/lib/utils/formatters';

interface BudgetComparisonSummaryCardsProps {
  summary: BudgetComparisonSummary;
  totalsDiff: BudgetTotalsDiff;
  priceAnalysis: PriceAnalysis;
}

export function BudgetComparisonSummaryCards({ 
  summary, 
  totalsDiff,
  priceAnalysis,
}: BudgetComparisonSummaryCardsProps) {
  const getCheaperLabel = () => {
    if (priceAnalysis.cheaperBudget === 'equal') return 'Valores iguais';
    return priceAnalysis.cheaperBudget === 'budget1' ? 'Orçamento 1 mais barato' : 'Orçamento 2 mais barato';
  };

  const getCheaperColor = () => {
    if (priceAnalysis.cheaperBudget === 'equal') return 'text-gray-600 dark:text-gray-300';
    return 'text-green-main';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card de Resultado Geral */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Resultado Geral
          </h3>
          <ImpactBadge impact={summary.overallImpact} />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Divergências:</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.totalDiffs}
            </span>
          </div>
          
          {summary.criticalDiffs > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-status-error">Críticas:</span>
              <span className="font-bold text-status-error">{summary.criticalDiffs}</span>
            </div>
          )}
          
          {summary.highDiffs > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-status-warning">Altas:</span>
              <span className="font-bold text-status-warning">{summary.highDiffs}</span>
            </div>
          )}
          
          {summary.mediumDiffs > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-yellow">Médias:</span>
              <span className="font-bold text-brand-yellow">{summary.mediumDiffs}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Card de Comparação de Preço */}
      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Comparação de Preço
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Orçamento 1:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.total.budget1)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Orçamento 2:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.total.budget2)}
            </span>
          </div>
          
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Diferença:</span>
              <span className={`font-bold ${totalsDiff.total.diff > 0 ? 'text-status-error' : totalsDiff.total.diff < 0 ? 'text-green-main' : 'text-gray-600'}`}>
                {totalsDiff.total.diff > 0 ? '+' : ''}{formatBRL(totalsDiff.total.diff)}
              </span>
            </div>
            <p className={`text-sm mt-2 ${getCheaperColor()}`}>
              {getCheaperLabel()}
            </p>
          </div>
        </div>
      </Card>

      {/* Card de Totais Lado a Lado */}
      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Detalhamento
          </h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
            <span></span>
            <span className="text-right">Orç 1</span>
            <span className="text-right">Orç 2</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
            <span className="text-right font-medium text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.subtotal.budget1)}
            </span>
            <span className="text-right font-medium text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.subtotal.budget2)}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 dark:text-gray-300">Descontos:</span>
            <span className="text-right font-medium text-green-main">
              -{formatBRL(totalsDiff.discounts.budget1)}
            </span>
            <span className="text-right font-medium text-green-main">
              -{formatBRL(totalsDiff.discounts.budget2)}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 dark:text-gray-300">Frete:</span>
            <span className="text-right font-medium text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.shipping.budget1)}
            </span>
            <span className="text-right font-medium text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.shipping.budget2)}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">Total:</span>
            <span className="text-right font-bold text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.total.budget1)}
            </span>
            <span className="text-right font-bold text-gray-900 dark:text-white">
              {formatBRL(totalsDiff.total.budget2)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
