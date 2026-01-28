'use client';

/**
 * Tabela de comparação de itens - Design System Amara NZero
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { StatusBadge, ImpactBadge } from '@/components/ui/Badge';
import { ItemDiff, ImpactLevel } from '@/lib/compare/types';
import { formatBRL, formatPercent } from '@/lib/utils/formatters';

interface ItemDiffTableProps {
  itemDiffs: ItemDiff[];
}

type FilterType = 'all' | 'divergent' | 'critical';

export function ItemDiffTable({ itemDiffs }: ItemDiffTableProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredItems = itemDiffs.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'divergent') return item.status !== 'match';
    if (filter === 'critical') return item.impact === 'critical' || item.impact === 'high';
    return true;
  });

  const divergentCount = itemDiffs.filter((i) => i.status !== 'match').length;
  const criticalCount = itemDiffs.filter((i) => i.impact === 'critical' || i.impact === 'high').length;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-bold text-brand-black dark:text-white">
          Comparação de Itens
        </h3>
        
        {/* Filtros */}
        <div className="flex gap-2">
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
            count={itemDiffs.length}
          >
            Todos
          </FilterButton>
          <FilterButton 
            active={filter === 'divergent'} 
            onClick={() => setFilter('divergent')}
            count={divergentCount}
          >
            Divergentes
          </FilterButton>
          <FilterButton 
            active={filter === 'critical'} 
            onClick={() => setFilter('critical')}
            count={criticalCount}
          >
            Críticos
          </FilterButton>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-grey-medium">
          {filter === 'all' 
            ? 'Nenhum item para comparar' 
            : 'Nenhum item corresponde ao filtro selecionado'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead align="center">Qtd Orç.</TableHead>
              <TableHead align="center">Qtd Cart.</TableHead>
              <TableHead align="right">Preço Orç.</TableHead>
              <TableHead align="right">Preço Cart.</TableHead>
              <TableHead align="center">Status</TableHead>
              <TableHead align="center">Impacto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <>
                <TableRow 
                  key={item.skuId}
                  className={getRowClassName(item.impact)}
                  onClick={() => setExpandedRow(expandedRow === item.skuId ? null : item.skuId)}
                >
                  <TableCell className="font-mono text-xs">{item.skuId}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.name}</TableCell>
                  <TableCell align="center">
                    {item.budgetQty ?? '-'}
                  </TableCell>
                  <TableCell align="center">
                    {item.cartQty ?? '-'}
                    {item.qtyDiffAbs !== undefined && item.qtyDiffAbs !== 0 && (
                      <span className={`ml-1 text-xs ${item.qtyDiffAbs > 0 ? 'text-status-error' : 'text-green-main'}`}>
                        ({item.qtyDiffAbs > 0 ? '+' : ''}{item.qtyDiffAbs})
                      </span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {item.budgetPrice !== undefined ? formatBRL(item.budgetPrice) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {item.cartPrice !== undefined ? formatBRL(item.cartPrice) : '-'}
                    {item.priceDiffPct !== undefined && Math.abs(item.priceDiffPct) > 0.01 && (
                      <span className={`ml-1 text-xs ${item.priceDiffPct > 0 ? 'text-status-error' : 'text-green-main'}`}>
                        ({formatPercent(item.priceDiffPct)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell align="center">
                    <ImpactBadge impact={item.impact} />
                  </TableCell>
                </TableRow>
                {/* Linha expandida com explicação */}
                {expandedRow === item.skuId && item.explanation && (
                  <TableRow key={`${item.skuId}-detail`}>
                    <TableCell colSpan={8} className="bg-card-bg">
                      <div className="py-2 px-4">
                        <p className="text-sm text-grey-dark">
                          <strong className="text-brand-black">Detalhes:</strong> {item.explanation}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function getRowClassName(impact: ImpactLevel): string {
  switch (impact) {
    case 'critical':
      return 'bg-status-error/5';
    case 'high':
      return 'bg-brand-yellow/10';
    case 'medium':
      return 'bg-brand-yellow/5';
    case 'low':
      return 'bg-brand-cyan/5';
    default:
      return '';
  }
}

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
}

function FilterButton({ children, active, onClick, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-md text-sm font-medium transition-colors
        ${active 
          ? 'bg-green-main text-white' 
          : 'bg-card-bg text-grey-dark hover:bg-grey-medium/20'}
      `}
    >
      {children} ({count})
    </button>
  );
}
