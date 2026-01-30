'use client';

/**
 * Tabela de diferenças de itens - Budget vs Budget
 * Design System Amara NZero
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge, ImpactBadge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { BudgetItemDiff } from '@/lib/compare/types';
import { formatBRL } from '@/lib/utils/formatters';

interface BudgetDiffTableProps {
  itemDiffs: BudgetItemDiff[];
}

type FilterType = 'all' | 'divergent' | 'critical';

const statusLabels: Record<BudgetItemDiff['status'], string> = {
  match: 'OK',
  price_diff: 'Preço diferente',
  quantity_diff: 'Qtd diferente',
  quantity_price_diff: 'Preço e Qtd',
  only_in_budget1: 'Só no Orç 1',
  only_in_budget2: 'Só no Orç 2',
};

const statusVariants: Record<BudgetItemDiff['status'], 'success' | 'warning' | 'error' | 'info'> = {
  match: 'success',
  price_diff: 'warning',
  quantity_diff: 'warning',
  quantity_price_diff: 'error',
  only_in_budget1: 'error',
  only_in_budget2: 'info',
};

/**
 * Formata peso em kg
 */
function formatWeight(weight: number): string {
  if (weight === 0) return '-';
  return `${weight.toFixed(2)} kg`;
}

export function BudgetDiffTable({ itemDiffs }: BudgetDiffTableProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredItems = itemDiffs.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'divergent') return item.status !== 'match';
    if (filter === 'critical') return item.impact === 'critical' || item.impact === 'high';
    return true;
  });

  const toggleRow = (skuId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(skuId)) {
      newExpanded.delete(skuId);
    } else {
      newExpanded.add(skuId);
    }
    setExpandedRows(newExpanded);
  };

  const divergentCount = itemDiffs.filter((i) => i.status !== 'match').length;
  const criticalCount = itemDiffs.filter((i) => i.impact === 'critical' || i.impact === 'high').length;

  return (
    <Card 
      title="Comparação de Itens" 
      subtitle={`${itemDiffs.length} item(ns) analisado(s), ${divergentCount} divergente(s)`}
    >
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filter === 'all'
              ? 'bg-green-main text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Todos ({itemDiffs.length})
        </button>
        <button
          onClick={() => setFilter('divergent')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filter === 'divergent'
              ? 'bg-status-warning text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Divergentes ({divergentCount})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filter === 'critical'
              ? 'bg-status-error text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Críticos ({criticalCount})
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">{''}</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-center">Qtd Orç1</TableHead>
              <TableHead className="text-center">Qtd Orç2</TableHead>
              <TableHead className="text-right">Preço Orç1</TableHead>
              <TableHead className="text-right">Preço Orç2</TableHead>
              <TableHead className="text-right">Peso Unit.</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Impacto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <>
                <TableRow 
                  key={item.skuId}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    item.status !== 'match' ? 'bg-status-warning/5' : ''
                  }`}
                  onClick={() => toggleRow(item.skuId)}
                >
                  <TableCell className="text-gray-400">
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedRows.has(item.skuId) ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.skuId}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="truncate block" title={item.name}>{item.name}</span>
                  </TableCell>
                  <TableCell className="text-center">{item.budget1Qty ?? '-'}</TableCell>
                  <TableCell className="text-center">{item.budget2Qty ?? '-'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {item.budget1Price !== undefined ? formatBRL(item.budget1Price) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.budget2Price !== undefined ? formatBRL(item.budget2Price) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-600 dark:text-gray-300">
                    {formatWeight(item.unitWeight)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariants[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <ImpactBadge impact={item.impact} />
                  </TableCell>
                </TableRow>

                {/* Linha expandida com detalhes */}
                {expandedRows.has(item.skuId) && (
                  <TableRow key={`${item.skuId}-details`}>
                    <TableCell colSpan={10} className="bg-gray-50 dark:bg-gray-700/30">
                      <div className="px-4 py-3 space-y-2">
                        {item.explanation && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.explanation}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {item.priceDiffAbs !== undefined && (
                            <span className={item.priceDiffAbs > 0 ? 'text-status-error' : 'text-green-main'}>
                              Diferença de preço: {item.priceDiffAbs > 0 ? '+' : ''}{formatBRL(item.priceDiffAbs)}
                              {item.priceDiffPct !== undefined && ` (${item.priceDiffPct > 0 ? '+' : ''}${item.priceDiffPct.toFixed(2)}%)`}
                            </span>
                          )}
                          {item.qtyDiff !== undefined && (
                            <span className={item.qtyDiff > 0 ? 'text-status-error' : 'text-green-main'}>
                              Diferença de quantidade: {item.qtyDiff > 0 ? '+' : ''}{item.qtyDiff}
                            </span>
                          )}
                          {item.unitWeight > 0 && (
                            <span className="text-gray-600 dark:text-gray-300">
                              Peso total Orç1: {formatWeight(item.unitWeight * (item.budget1Qty || 0))}
                              {' | '}
                              Peso total Orç2: {formatWeight(item.unitWeight * (item.budget2Qty || 0))}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum item encontrado com o filtro selecionado.
        </div>
      )}
    </Card>
  );
}
