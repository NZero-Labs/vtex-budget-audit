/**
 * Componente Badge - Design System Amara NZero
 */

import { ImpactLevel, ItemDiffStatus } from '@/lib/compare/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-grey-medium/20 text-grey-dark',
  success: 'bg-green-main/15 text-green-main',
  warning: 'bg-brand-yellow/15 text-[#b38600]',
  error: 'bg-status-error/15 text-status-error',
  info: 'bg-brand-cyan/15 text-brand-cyan',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

/**
 * Badge específico para nível de impacto - Amara NZero
 */
interface ImpactBadgeProps {
  impact: ImpactLevel;
  className?: string;
}

const impactConfig: Record<ImpactLevel, { label: string; variant: BadgeProps['variant'] }> = {
  none: { label: 'OK', variant: 'success' },
  low: { label: 'Baixo', variant: 'info' },
  medium: { label: 'Médio', variant: 'warning' },
  high: { label: 'Alto', variant: 'error' },
  critical: { label: 'Crítico', variant: 'error' },
};

export function ImpactBadge({ impact, className = '' }: ImpactBadgeProps) {
  const config = impactConfig[impact];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

/**
 * Badge específico para status de item - Amara NZero
 */
interface StatusBadgeProps {
  status: ItemDiffStatus;
  className?: string;
}

const statusConfig: Record<ItemDiffStatus, { label: string; variant: BadgeProps['variant'] }> = {
  match: { label: 'Igual', variant: 'success' },
  quantity_diff: { label: 'Qtd Diferente', variant: 'warning' },
  price_diff: { label: 'Preço Diferente', variant: 'warning' },
  quantity_price_diff: { label: 'Qtd e Preço Dif.', variant: 'error' },
  missing_in_cart: { label: 'Falta no Carrinho', variant: 'error' },
  unexpected_in_cart: { label: 'Extra no Carrinho', variant: 'error' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
