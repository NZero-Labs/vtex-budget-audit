'use client';

/**
 * Componente de diferenças de entrega - Design System Amara NZero
 */

import { Card } from '@/components/ui/Card';
import { Badge, ImpactBadge } from '@/components/ui/Badge';
import { ShippingDiff } from '@/lib/compare/types';
import { formatBRL, formatPercent, formatCEP } from '@/lib/utils/formatters';

interface ShippingDiffsProps {
  shippingDiff: ShippingDiff | null;
  /** Labels customizados para os lados da comparação */
  labels?: {
    left: string;
    right: string;
  };
}

export function ShippingDiffs({ shippingDiff, labels }: ShippingDiffsProps) {
  // Labels padrão para Budget vs Cart
  const leftLabel = labels?.left || 'Orçamento';
  const rightLabel = labels?.right || 'Carrinho';

  if (!shippingDiff) {
    return (
      <Card title="Dados de Entrega">
        <p className="text-grey-medium text-center py-4">
          Sem dados de entrega para comparar
        </p>
      </Card>
    );
  }

  const hasDiff = shippingDiff.postalCodeDiff || 
                  shippingDiff.deliveryTypeDiff || 
                  Math.abs(shippingDiff.shippingValueDiff.diff) > 0.01;

  return (
    <Card title="Dados de Entrega">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#3c3c3b] dark:text-white">Status da comparação</span>
        <ImpactBadge impact={shippingDiff.impact} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CEP */}
        <div className={`p-4 rounded-lg ${shippingDiff.postalCodeDiff ? 'bg-status-error/5' : 'bg-green-main/5'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#3c3c3b] dark:text-white">CEP</span>
            {shippingDiff.postalCodeDiff ? (
              <Badge variant="error">Diferente</Badge>
            ) : (
              <Badge variant="success">Igual</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-[#575756] dark:text-white/80 block mb-1">{leftLabel}:</span>
              <p className="font-mono font-semibold text-base text-[#3c3c3b] dark:text-white">
                {shippingDiff.budgetPostalCode ? formatCEP(shippingDiff.budgetPostalCode) : '-'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#575756] dark:text-white/80 block mb-1">{rightLabel}:</span>
              <p className="font-mono font-semibold text-base text-[#3c3c3b] dark:text-white">
                {shippingDiff.cartPostalCode ? formatCEP(shippingDiff.cartPostalCode) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Tipo de Entrega */}
        <div className={`p-4 rounded-lg ${shippingDiff.deliveryTypeDiff ? 'bg-brand-yellow/10' : 'bg-green-main/5'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#3c3c3b] dark:text-white">Tipo de Entrega</span>
            {shippingDiff.deliveryTypeDiff ? (
              <Badge variant="warning">Diferente</Badge>
            ) : (
              <Badge variant="success">Igual</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-[#575756] dark:text-white/80 block mb-1">{leftLabel}:</span>
              <p className="font-semibold text-base text-[#3c3c3b] dark:text-white">{shippingDiff.budgetDeliveryType || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-[#575756] dark:text-white/80 block mb-1">{rightLabel}:</span>
              <p className="font-semibold text-base text-[#3c3c3b] dark:text-white">{shippingDiff.cartDeliveryType || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Valor do Frete */}
      <div className={`mt-4 p-4 rounded-lg ${Math.abs(shippingDiff.shippingValueDiff.diff) > 0.01 ? 'bg-brand-yellow/10' : 'bg-green-main/5'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#3c3c3b] dark:text-white">Valor do Frete</span>
          {Math.abs(shippingDiff.shippingValueDiff.diff) > 0.01 ? (
            <Badge variant="warning">
              {shippingDiff.shippingValueDiff.diff > 0 ? `Maior no ${rightLabel.toLowerCase()}` : `Menor no ${rightLabel.toLowerCase()}`}
            </Badge>
          ) : (
            <Badge variant="success">Igual</Badge>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-[#575756] dark:text-white/80 block mb-1">{leftLabel}:</span>
            <p className="font-bold text-lg text-[#3c3c3b] dark:text-white">{formatBRL(shippingDiff.shippingValueDiff.budget)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-[#575756] dark:text-white/80 block mb-1">{rightLabel}:</span>
            <p className="font-bold text-lg text-[#3c3c3b] dark:text-white">{formatBRL(shippingDiff.shippingValueDiff.cart)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-[#575756] dark:text-white/80 block mb-1">Diferença:</span>
            <p className={`font-bold text-lg ${shippingDiff.shippingValueDiff.diff > 0 ? 'text-status-error' : shippingDiff.shippingValueDiff.diff < 0 ? 'text-green-main' : 'text-[#3c3c3b] dark:text-white'}`}>
              {shippingDiff.shippingValueDiff.diff !== 0 && (
                <>
                  {shippingDiff.shippingValueDiff.diff > 0 ? '+' : ''}
                  {formatBRL(shippingDiff.shippingValueDiff.diff)}
                  <span className="text-sm ml-1">
                    ({formatPercent(shippingDiff.shippingValueDiff.diffPct)})
                  </span>
                </>
              )}
              {shippingDiff.shippingValueDiff.diff === 0 && '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Explicação */}
      {shippingDiff.explanation && (
        <div className="mt-4 p-4 bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg">
          <p className="text-sm text-[#3c3c3b] dark:text-white leading-relaxed">
            <strong>Análise:</strong> {shippingDiff.explanation}
          </p>
        </div>
      )}

      {!hasDiff && (
        <div className="mt-4 p-4 bg-green-main/5 rounded-lg">
          <p className="text-sm font-medium text-green-main">
            Dados de entrega alinhados entre {leftLabel.toLowerCase()} e {rightLabel.toLowerCase()}.
          </p>
        </div>
      )}
    </Card>
  );
}
