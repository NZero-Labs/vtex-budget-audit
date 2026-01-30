'use client';

/**
 * Card de resumo de peso - Comparação Budget vs Budget
 * Design System Amara NZero
 */

import { Card } from '@/components/ui/Card';
import { WeightComparison } from '@/lib/compare/types';
import { getFormattedWeightRange, isSameWeightRange } from '@/lib/shipping/weightRanges';

interface WeightSummaryProps {
  weightInfo: WeightComparison;
}

/**
 * Formata peso em kg
 */
function formatWeight(weight: number): string {
  return `${weight.toFixed(2)} kg`;
}

export function WeightSummary({ weightInfo }: WeightSummaryProps) {
  const { budget1, budget2, difference, heavier } = weightInfo;

  // Verifica se os orçamentos estão em faixas diferentes
  const sameRange = isSameWeightRange(budget1.totalWeight, budget2.totalWeight);
  const budget1Range = getFormattedWeightRange(budget1.totalWeight);
  const budget2Range = getFormattedWeightRange(budget2.totalWeight);

  const getHeavierLabel = () => {
    if (heavier === 'equal') return 'Pesos equivalentes';
    return heavier === 'budget1' ? 'Orçamento 1 mais pesado' : 'Orçamento 2 mais pesado';
  };

  const getHeavierColor = () => {
    if (heavier === 'equal') return 'text-gray-600 dark:text-gray-300';
    return 'text-brand-cyan';
  };

  return (
    <Card title="Peso Total" subtitle="Comparação de peso entre os orçamentos (frete CIF-PDO)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orçamento 1 */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Orçamento 1</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatWeight(budget1.totalWeight)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {budget1.itemWeights.length} item(ns)
          </p>
          {/* Faixa de peso */}
          <div className="mt-3 px-3 py-2 bg-green-main/10 border border-green-main/20 rounded-md">
            <p className="text-xs text-gray-500 dark:text-gray-400">Faixa CIF-PDO</p>
            <p className="text-sm font-semibold text-green-main">{budget1Range}</p>
          </div>
        </div>

        {/* Orçamento 2 */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Orçamento 2</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatWeight(budget2.totalWeight)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {budget2.itemWeights.length} item(ns)
          </p>
          {/* Faixa de peso */}
          <div className="mt-3 px-3 py-2 bg-green-main/10 border border-green-main/20 rounded-md">
            <p className="text-xs text-gray-500 dark:text-gray-400">Faixa CIF-PDO</p>
            <p className="text-sm font-semibold text-green-main">{budget2Range}</p>
          </div>
        </div>

        {/* Diferença */}
        <div className="text-center p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Diferença</p>
          <p className={`text-2xl font-bold ${difference !== 0 ? 'text-brand-cyan' : 'text-gray-600 dark:text-gray-300'}`}>
            {difference > 0 ? '+' : ''}{formatWeight(difference)}
          </p>
          <p className={`text-xs mt-1 ${getHeavierColor()}`}>
            {getHeavierLabel()}
          </p>
          {/* Indicador de faixas diferentes */}
          {!sameRange && (
            <div className="mt-3 px-3 py-2 bg-status-warning/10 border border-status-warning/30 rounded-md">
              <div className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-medium text-status-warning">Faixas diferentes!</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Impacto no valor do frete
              </p>
            </div>
          )}
          {sameRange && (
            <div className="mt-3 px-3 py-2 bg-green-main/10 border border-green-main/20 rounded-md">
              <div className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 text-green-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-green-main">Mesma faixa</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ícone de peso */}
      <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
        <span className="text-sm">
          Peso calculado com base nos dados do Catálogo VTEX
        </span>
      </div>
    </Card>
  );
}
