/**
 * Funções utilitárias para formatação
 */

/**
 * Formata valor monetário em reais brasileiro
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com casas decimais
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata percentual
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}%`;
}

/**
 * Formata data ISO para formato brasileiro
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Formata CEP brasileiro
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return cep;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Trunca texto com ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
