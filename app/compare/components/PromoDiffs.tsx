'use client';

/**
 * Componente de diferenças de promoções - Design System Amara NZero
 */

import { Card } from '@/components/ui/Card';
import { Badge, ImpactBadge } from '@/components/ui/Badge';
import { PromoDiff } from '@/lib/compare/types';
import { formatBRL } from '@/lib/utils/formatters';

interface PromoDiffsProps {
  promoDiffs: PromoDiff[];
  /** Labels customizados para os lados da comparação */
  labels?: {
    left: string;
    right: string;
  };
}

export function PromoDiffs({ promoDiffs, labels }: PromoDiffsProps) {
  // Labels padrão para Budget vs Cart
  const leftLabel = labels?.left || 'Orçamento';
  const rightLabel = labels?.right || 'Carrinho';

  if (promoDiffs.length === 0) {
    return null;
  }

  const hasIssues = promoDiffs.some((p) => p.status !== 'match');

  return (
    <Card 
      title="Promoções e Benefícios" 
      subtitle={`${promoDiffs.length} promoção(ões) analisada(s)`}
    >
      <div className="space-y-3">
        {promoDiffs.map((promo) => (
          <div 
            key={promo.id}
            className={`
              p-4 rounded-lg border
              ${promo.status === 'match' 
                ? 'bg-green-main/5 border-green-main/20' 
                : promo.status === 'only_in_budget'
                  ? 'bg-status-error/5 border-status-error/20'
                  : promo.status === 'only_in_cart'
                    ? 'bg-brand-cyan/5 border-brand-cyan/20'
                    : 'bg-brand-yellow/5 border-brand-yellow/20'}
            `}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-brand-black dark:text-white">
                    {promo.name}
                  </span>
                  <PromoStatusBadge status={promo.status} />
                </div>
                <p className="text-xs text-grey-medium mt-1 font-mono">
                  ID: {promo.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ImpactBadge impact={promo.impact} />
              </div>
            </div>

            {/* Valores */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {promo.budgetValue !== undefined && (
                <div>
                  <span className="text-grey-medium">{leftLabel}: </span>
                  <span className="font-medium text-brand-black">{formatBRL(promo.budgetValue)}</span>
                </div>
              )}
              {promo.cartValue !== undefined && (
                <div>
                  <span className="text-grey-medium">{rightLabel}: </span>
                  <span className="font-medium text-brand-black">{formatBRL(promo.cartValue)}</span>
                </div>
              )}
              {promo.valueDiff !== undefined && Math.abs(promo.valueDiff) > 0.01 && (
                <div className={promo.valueDiff > 0 ? 'text-green-main' : 'text-status-error'}>
                  <span className="text-grey-medium">Diferença: </span>
                  <span className="font-medium">
                    {promo.valueDiff > 0 ? '+' : ''}{formatBRL(promo.valueDiff)}
                  </span>
                </div>
              )}
            </div>

            {/* Explicação */}
            {promo.explanation && (
              <p className="mt-2 text-sm text-grey-dark">
                {promo.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {!hasIssues && (
        <div className="mt-4 p-3 bg-green-main/5 rounded-lg">
          <p className="text-sm text-green-main">
            Todas as promoções estão alinhadas entre {leftLabel.toLowerCase()} e {rightLabel.toLowerCase()}.
          </p>
        </div>
      )}
    </Card>
  );
}

interface PromoStatusBadgeProps {
  status: PromoDiff['status'];
}

function PromoStatusBadge({ status }: PromoStatusBadgeProps) {
  const config: Record<PromoDiff['status'], { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
    match: { label: 'Aplicada', variant: 'success' },
    only_in_budget: { label: 'Não aplicada', variant: 'error' },
    only_in_cart: { label: 'Extra', variant: 'info' },
    value_diff: { label: 'Valor diferente', variant: 'warning' },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
