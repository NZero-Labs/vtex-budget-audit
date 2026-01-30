'use client';

/**
 * Análise de diferenças de preço - Por que um orçamento é mais caro
 * Design System Amara NZero
 */

import { Card } from '@/components/ui/Card';
import { PriceAnalysis } from '@/lib/compare/types';
import { formatBRL } from '@/lib/utils/formatters';

interface PriceBreakdownProps {
  priceAnalysis: PriceAnalysis;
}

const categoryLabels: Record<string, string> = {
  items: 'Itens',
  shipping: 'Frete',
  discounts: 'Descontos',
  taxes: 'Impostos',
};

const categoryIcons: Record<string, React.ReactNode> = {
  items: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  shipping: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  discounts: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
  taxes: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

export function PriceBreakdown({ priceAnalysis }: PriceBreakdownProps) {
  const { cheaperBudget, priceDifference, breakdown } = priceAnalysis;

  // Se não houver diferença significativa
  if (breakdown.length === 0) {
    return (
      <Card title="Análise de Preço" subtitle="Por que um orçamento é mais caro que o outro">
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-green-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Os valores dos orçamentos são equivalentes.</p>
          <p className="text-sm mt-1">Não há diferenças significativas para analisar.</p>
        </div>
      </Card>
    );
  }

  const getCheaperText = () => {
    if (cheaperBudget === 'equal') return 'Os orçamentos têm o mesmo valor';
    const cheaper = cheaperBudget === 'budget1' ? 'Orçamento 1' : 'Orçamento 2';
    const savings = Math.abs(priceDifference);
    return `${cheaper} é mais barato em ${formatBRL(savings)}`;
  };

  return (
    <Card title="Análise de Preço" subtitle="Por que um orçamento é mais caro que o outro">
      {/* Resumo */}
      <div className={`
        p-4 rounded-lg mb-6
        ${cheaperBudget === 'equal' 
          ? 'bg-gray-100 dark:bg-gray-700' 
          : 'bg-green-main/10 border border-green-main/20'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-full
            ${cheaperBudget === 'equal' ? 'bg-gray-200 dark:bg-gray-600' : 'bg-green-main/20'}
          `}>
            <svg 
              className={`w-6 h-6 ${cheaperBudget === 'equal' ? 'text-gray-500' : 'text-green-main'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className={`font-semibold ${cheaperBudget === 'equal' ? 'text-gray-700 dark:text-gray-200' : 'text-green-main'}`}>
              {getCheaperText()}
            </p>
            {cheaperBudget !== 'equal' && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Diferença total: {priceDifference > 0 ? '+' : ''}{formatBRL(priceDifference)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown detalhado */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Detalhamento das diferenças:
        </h4>

        {breakdown.map((item, index) => (
          <div 
            key={`${item.category}-${index}`}
            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {/* Ícone */}
            <div className={`
              p-2 rounded-lg
              ${item.impact === 'expensive' 
                ? 'bg-status-error/10 text-status-error' 
                : item.impact === 'cheaper'
                  ? 'bg-green-main/10 text-green-main'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}
            `}>
              {categoryIcons[item.category]}
            </div>

            {/* Conteúdo */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {categoryLabels[item.category]}
                </span>
                <span className={`
                  font-bold
                  ${item.impact === 'expensive' 
                    ? 'text-status-error' 
                    : item.impact === 'cheaper'
                      ? 'text-green-main'
                      : 'text-gray-600 dark:text-gray-300'}
                `}>
                  {item.difference > 0 ? '+' : ''}{formatBRL(item.difference)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {item.description}
              </p>

              {/* Valores lado a lado */}
              <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400">
                <span>Orç 1: {formatBRL(item.budget1Value)}</span>
                <span>Orç 2: {formatBRL(item.budget2Value)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
