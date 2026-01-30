/**
 * Faixas de peso para frete CIF-PDO
 * 
 * Define as faixas de peso utilizadas para cálculo de frete
 * e funções utilitárias para classificação.
 */

/**
 * Interface para faixa de peso
 */
export interface WeightRange {
  /** Peso inicial da faixa em kg */
  start: number;
  /** Peso final da faixa em kg */
  end: number;
}

/**
 * Faixas de peso CIF-PDO
 * Valores em kg
 */
export const CIF_PDO_WEIGHT_RANGES: WeightRange[] = [
  { start: 0, end: 30 },
  { start: 30.1, end: 750 },
  { start: 750.1, end: 2250 },
  { start: 2250.1, end: 3000 },
  { start: 3000.1, end: 3750 },
  { start: 3750.1, end: 4500 },
  { start: 4500.1, end: 5250 },
  { start: 5250.1, end: 6000 },
  { start: 6000.1, end: 6750 },
  { start: 6750.1, end: 7500 },
  { start: 7500.1, end: 8250 },
  { start: 8250.1, end: 9750 },
  { start: 9750.1, end: 11250 },
  { start: 11250.1, end: 12750 },
  { start: 12750.1, end: 14250 },
  { start: 14250.1, end: 15750 },
  { start: 15750.1, end: 23250 },
  { start: 23250.1, end: 30750 },
];

/**
 * Peso máximo suportado pelas faixas CIF-PDO
 */
export const MAX_CIF_PDO_WEIGHT = 30750;

/**
 * Retorna a faixa de peso para um dado peso total
 * 
 * @param weight Peso em kg
 * @returns Faixa de peso correspondente ou null se acima do máximo
 */
export function getWeightRange(weight: number): WeightRange | null {
  if (weight < 0) return null;
  
  for (const range of CIF_PDO_WEIGHT_RANGES) {
    if (weight >= range.start && weight <= range.end) {
      return range;
    }
  }
  
  // Peso acima da faixa máxima
  return null;
}

/**
 * Retorna o índice da faixa de peso (útil para comparações)
 * 
 * @param weight Peso em kg
 * @returns Índice da faixa (0-17) ou -1 se não encontrada
 */
export function getWeightRangeIndex(weight: number): number {
  if (weight < 0) return -1;
  
  for (let i = 0; i < CIF_PDO_WEIGHT_RANGES.length; i++) {
    const range = CIF_PDO_WEIGHT_RANGES[i];
    if (weight >= range.start && weight <= range.end) {
      return i;
    }
  }
  
  return -1;
}

/**
 * Formata uma faixa de peso para exibição
 * 
 * @param range Faixa de peso
 * @returns String formatada (ex: "30,1 - 750 kg")
 */
export function formatWeightRange(range: WeightRange): string {
  const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    });
  };
  
  return `${formatNumber(range.start)} - ${formatNumber(range.end)} kg`;
}

/**
 * Retorna a faixa formatada para um peso, ou mensagem de erro
 * 
 * @param weight Peso em kg
 * @returns String formatada da faixa ou mensagem especial
 */
export function getFormattedWeightRange(weight: number): string {
  if (weight < 0) {
    return 'Peso inválido';
  }
  
  const range = getWeightRange(weight);
  
  if (!range) {
    return `Acima de ${MAX_CIF_PDO_WEIGHT.toLocaleString('pt-BR')} kg`;
  }
  
  return formatWeightRange(range);
}

/**
 * Verifica se dois pesos estão na mesma faixa
 * 
 * @param weight1 Primeiro peso em kg
 * @param weight2 Segundo peso em kg
 * @returns true se ambos estão na mesma faixa
 */
export function isSameWeightRange(weight1: number, weight2: number): boolean {
  const index1 = getWeightRangeIndex(weight1);
  const index2 = getWeightRangeIndex(weight2);
  
  // Se algum estiver fora das faixas, considera diferente
  if (index1 === -1 || index2 === -1) {
    return false;
  }
  
  return index1 === index2;
}

/**
 * Calcula a diferença de faixas entre dois pesos
 * 
 * @param weight1 Primeiro peso em kg
 * @param weight2 Segundo peso em kg
 * @returns Número de faixas de diferença (positivo se weight2 > weight1)
 */
export function getWeightRangeDifference(weight1: number, weight2: number): number {
  const index1 = getWeightRangeIndex(weight1);
  const index2 = getWeightRangeIndex(weight2);
  
  if (index1 === -1 || index2 === -1) {
    return 0;
  }
  
  return index2 - index1;
}
