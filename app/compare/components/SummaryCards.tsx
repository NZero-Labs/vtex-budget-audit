'use client';

/**
 * Cards de resumo da comparação - Design System Amara NZero
 */

import { Card } from '@/components/ui/Card';
import { ImpactBadge } from '@/components/ui/Badge';
import { ComparisonSummary, TotalsDiff } from '@/lib/compare/types';
import { formatBRL, formatPercent } from '@/lib/utils/formatters';

interface SummaryCardsProps {
  summary: ComparisonSummary;
  totalsDiff: TotalsDiff;
}

export function SummaryCards({ summary, totalsDiff }: SummaryCardsProps) {
  return (
    <div className="space-y-6">
      {/* Card de Resumo Geral */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-brand-black dark:text-white">
              Resultado da Comparação
            </h3>
            <p className="text-base text-brand-black/70 dark:text-white/70 mt-2">
              {summary.totalDiffs === 0 
                ? 'Nenhuma divergência encontrada'
                : `${summary.totalDiffs} divergência(s) encontrada(s)`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ImpactBadge impact={summary.overallImpact} className="text-sm px-4 py-1.5" />
            {summary.financialImpact !== 0 && (
              <div className={`text-xl font-bold ${summary.financialImpact > 0 ? 'text-status-error' : 'text-green-main'}`}>
                {summary.financialImpact > 0 ? '+' : ''}{formatBRL(summary.financialImpact)}
              </div>
            )}
          </div>
        </div>

        {/* Contadores de criticidade */}
        {summary.totalDiffs > 0 && (
          <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-grey-medium/20">
            {summary.criticalDiffs > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-error" />
                <span className="text-sm font-medium text-brand-black/80 dark:text-white/80">
                  {summary.criticalDiffs} crítica(s)
                </span>
              </div>
            )}
            {summary.highDiffs > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-yellow" />
                <span className="text-sm font-medium text-brand-black/80 dark:text-white/80">
                  {summary.highDiffs} alta(s)
                </span>
              </div>
            )}
            {summary.mediumDiffs > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-yellow/60" />
                <span className="text-sm font-medium text-brand-black/80 dark:text-white/80">
                  {summary.mediumDiffs} média(s)
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Cards de Totais lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orçamento */}
        <Card title="Orçamento" className="border-l-4 border-brand-cyan">
          <div className="space-y-3">
            <TotalRow label="Subtotal" value={totalsDiff.subtotal.budget} />
            <TotalRow label="Descontos" value={-totalsDiff.discounts.budget} isNegative />
            <TotalRow label="Frete" value={totalsDiff.shipping.budget} />
            <TotalRow label="Impostos" value={totalsDiff.taxes.budget} />
            <div className="pt-3 border-t border-grey-medium/20">
              <TotalRow label="Total" value={totalsDiff.total.budget} isTotal />
            </div>
          </div>
        </Card>

        {/* Carrinho */}
        <Card title="Carrinho" className="border-l-4 border-green-main">
          <div className="space-y-3">
            <TotalRow 
              label="Subtotal" 
              value={totalsDiff.subtotal.cart} 
              diff={totalsDiff.subtotal.diff}
              diffPct={totalsDiff.subtotal.diffPct}
            />
            <TotalRow 
              label="Descontos" 
              value={-totalsDiff.discounts.cart} 
              diff={-totalsDiff.discounts.diff}
              diffPct={totalsDiff.discounts.diffPct}
              isNegative 
            />
            <TotalRow 
              label="Frete" 
              value={totalsDiff.shipping.cart} 
              diff={totalsDiff.shipping.diff}
              diffPct={totalsDiff.shipping.diffPct}
            />
            <TotalRow 
              label="Impostos" 
              value={totalsDiff.taxes.cart} 
              diff={totalsDiff.taxes.diff}
              diffPct={totalsDiff.taxes.diffPct}
            />
            <div className="pt-3 border-t border-grey-medium/20">
              <TotalRow 
                label="Total" 
                value={totalsDiff.total.cart} 
                diff={totalsDiff.total.diff}
                diffPct={totalsDiff.total.diffPct}
                isTotal 
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Explicação do impacto */}
      {totalsDiff.explanation && (
        <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg">
          <p className="text-sm text-brand-black/80 dark:text-white/80 leading-relaxed">
            <strong className="text-brand-black dark:text-white">Análise:</strong> {totalsDiff.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

interface TotalRowProps {
  label: string;
  value: number;
  diff?: number;
  diffPct?: number;
  isTotal?: boolean;
  isNegative?: boolean;
}

function TotalRow({ label, value, diff, diffPct, isTotal, isNegative }: TotalRowProps) {
  const hasDiff = diff !== undefined && Math.abs(diff) > 0.01;
  
  return (
    <div className={`flex justify-between items-center py-1 ${isTotal ? 'font-bold text-lg' : 'text-base'}`}>
      <span className="text-brand-black/70 dark:text-white/70">{label}</span>
      <div className="text-right">
        <span className={`font-medium ${isNegative && value !== 0 ? 'text-green-main' : 'text-brand-black dark:text-white'}`}>
          {formatBRL(value)}
        </span>
        {hasDiff && (
          <span className={`ml-2 text-sm font-medium ${diff! > 0 ? 'text-status-error' : 'text-green-main'}`}>
            ({formatPercent(diffPct!)})
          </span>
        )}
      </div>
    </div>
  );
}
