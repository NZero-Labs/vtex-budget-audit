/**
 * Funções de comparação Budget vs Budget
 * 
 * Compara dois orçamentos e identifica diferenças de itens, preços,
 * promoções, frete e peso.
 */

import {
  NormalizedData,
  NormalizedItem,
  BudgetItemDiff,
  BudgetTotalsDiff,
  BudgetComparisonSummary,
  BudgetComparisonResult,
  BudgetComparisonMetadata,
  PriceAnalysis,
  PriceBreakdownItem,
  WeightInfo,
  WeightComparison,
  ItemWeight,
  ShippingDiff,
  PromoDiff,
  MarketingTagDiff,
  ImpactLevel,
} from './types';
import {
  calculatePercentageDiff,
  determineImpact,
  formatCurrency,
  compareShipping,
  comparePromotions,
  compareMarketingTags,
} from './compareUtils';

// =============================================================================
// Cálculo de Peso
// =============================================================================

/**
 * Calcula informações de peso para os itens de um orçamento
 * 
 * @param items Itens normalizados do orçamento
 * @param skuWeights Mapa de SKU ID -> peso em kg
 * @returns Informações de peso agregadas
 */
export function calculateWeightInfo(
  items: NormalizedItem[],
  skuWeights: Map<string, number>
): WeightInfo {
  const itemWeights: ItemWeight[] = items.map((item) => {
    const unitWeight = skuWeights.get(item.skuId) || 0;
    const totalWeight = unitWeight * item.quantity;

    return {
      skuId: item.skuId,
      name: item.name,
      quantity: item.quantity,
      unitWeight,
      totalWeight,
    };
  });

  const totalWeight = itemWeights.reduce((sum, item) => sum + item.totalWeight, 0);

  return {
    totalWeight,
    itemWeights,
  };
}

/**
 * Compara informações de peso entre dois orçamentos
 */
export function compareWeights(
  budget1Weight: WeightInfo,
  budget2Weight: WeightInfo
): WeightComparison {
  const difference = budget2Weight.totalWeight - budget1Weight.totalWeight;

  let heavier: 'budget1' | 'budget2' | 'equal' = 'equal';
  if (Math.abs(difference) > 0.01) {
    heavier = difference > 0 ? 'budget2' : 'budget1';
  }

  return {
    budget1: budget1Weight,
    budget2: budget2Weight,
    difference,
    heavier,
  };
}

// =============================================================================
// Comparação de Itens
// =============================================================================

/**
 * Compara itens entre dois orçamentos
 */
export function compareBudgetItems(
  budget1Items: NormalizedItem[],
  budget2Items: NormalizedItem[],
  skuWeights: Map<string, number>
): BudgetItemDiff[] {
  const diffs: BudgetItemDiff[] = [];
  const processedBudget2Skus = new Set<string>();

  // Para cada item do orçamento 1
  for (const item1 of budget1Items) {
    const item2 = budget2Items.find((item) => item.skuId === item1.skuId);
    const unitWeight = skuWeights.get(item1.skuId) || 0;

    if (!item2) {
      // Item apenas no orçamento 1
      diffs.push({
        skuId: item1.skuId,
        name: item1.name,
        status: 'only_in_budget1',
        budget1Qty: item1.quantity,
        budget1Price: item1.unitPrice,
        unitWeight,
        impact: 'high',
        explanation: `Item "${item1.name}" está apenas no Orçamento 1. ` +
          `Valor: ${formatCurrency(item1.totalPrice)}, Peso: ${(unitWeight * item1.quantity).toFixed(2)}kg`,
      });
    } else {
      processedBudget2Skus.add(item2.skuId);
      const itemDiff = compareBudgetItemPair(item1, item2, unitWeight);
      diffs.push(itemDiff);
    }
  }

  // Itens no orçamento 2 que não estão no orçamento 1
  for (const item2 of budget2Items) {
    if (!processedBudget2Skus.has(item2.skuId)) {
      const unitWeight = skuWeights.get(item2.skuId) || 0;
      diffs.push({
        skuId: item2.skuId,
        name: item2.name,
        status: 'only_in_budget2',
        budget2Qty: item2.quantity,
        budget2Price: item2.unitPrice,
        unitWeight,
        impact: 'high',
        explanation: `Item "${item2.name}" está apenas no Orçamento 2. ` +
          `Valor: ${formatCurrency(item2.totalPrice)}, Peso: ${(unitWeight * item2.quantity).toFixed(2)}kg`,
      });
    }
  }

  return diffs;
}

/**
 * Compara um par de itens (budget1 vs budget2) do mesmo SKU
 */
function compareBudgetItemPair(
  item1: NormalizedItem,
  item2: NormalizedItem,
  unitWeight: number
): BudgetItemDiff {
  const qtyDiff = item2.quantity - item1.quantity;
  const priceDiff = item2.unitPrice - item1.unitPrice;
  const priceDiffPct = calculatePercentageDiff(item1.unitPrice, item2.unitPrice);

  const hasQtyDiff = qtyDiff !== 0;
  const hasPriceDiff = Math.abs(priceDiffPct) > 0.01;

  let status: BudgetItemDiff['status'] = 'match';
  if (hasQtyDiff && hasPriceDiff) {
    status = 'quantity_price_diff';
  } else if (hasQtyDiff) {
    status = 'quantity_diff';
  } else if (hasPriceDiff) {
    status = 'price_diff';
  }

  const impact = status === 'match'
    ? 'none'
    : determineImpact(priceDiffPct, priceDiff);

  let explanation: string | undefined;
  if (status !== 'match') {
    const parts: string[] = [];
    if (hasQtyDiff) {
      parts.push(`Quantidade: Orç1 ${item1.quantity}, Orç2 ${item2.quantity} (${qtyDiff > 0 ? '+' : ''}${qtyDiff})`);
    }
    if (hasPriceDiff) {
      parts.push(`Preço: Orç1 ${formatCurrency(item1.unitPrice)}, Orç2 ${formatCurrency(item2.unitPrice)} (${priceDiffPct > 0 ? '+' : ''}${priceDiffPct.toFixed(2)}%)`);
    }
    explanation = parts.join('. ');
  }

  return {
    skuId: item1.skuId,
    name: item1.name,
    status,
    budget1Qty: item1.quantity,
    budget2Qty: item2.quantity,
    budget1Price: item1.unitPrice,
    budget2Price: item2.unitPrice,
    unitWeight,
    priceDiffAbs: hasPriceDiff ? priceDiff : undefined,
    priceDiffPct: hasPriceDiff ? priceDiffPct : undefined,
    qtyDiff: hasQtyDiff ? qtyDiff : undefined,
    impact,
    explanation,
  };
}

// =============================================================================
// Comparação de Totais
// =============================================================================

/**
 * Compara totais financeiros entre dois orçamentos
 */
export function compareBudgetTotals(
  budget1Totals: NormalizedData['totals'],
  budget2Totals: NormalizedData['totals']
): BudgetTotalsDiff {
  const compareTotalField = (val1: number, val2: number) => ({
    budget1: val1,
    budget2: val2,
    diff: val2 - val1,
    diffPct: calculatePercentageDiff(val1, val2),
  });

  const subtotal = compareTotalField(budget1Totals.subtotal, budget2Totals.subtotal);
  const discounts = compareTotalField(budget1Totals.discounts, budget2Totals.discounts);
  const shipping = compareTotalField(budget1Totals.shipping, budget2Totals.shipping);
  const taxes = compareTotalField(budget1Totals.taxes, budget2Totals.taxes);
  const total = compareTotalField(budget1Totals.total, budget2Totals.total);

  const impact = determineImpact(total.diffPct, total.diff);

  let explanation: string | undefined;
  if (impact !== 'none') {
    const parts: string[] = [];

    if (Math.abs(subtotal.diffPct) > 0.1) {
      parts.push(`Subtotal ${subtotal.diff > 0 ? 'maior' : 'menor'} no Orç2: ${formatCurrency(Math.abs(subtotal.diff))}`);
    }
    if (Math.abs(discounts.diff) > 0.01) {
      parts.push(`Descontos ${discounts.diff > 0 ? 'maiores' : 'menores'} no Orç2: ${formatCurrency(Math.abs(discounts.diff))}`);
    }
    if (Math.abs(shipping.diff) > 0.01) {
      parts.push(`Frete ${shipping.diff > 0 ? 'maior' : 'menor'} no Orç2: ${formatCurrency(Math.abs(shipping.diff))}`);
    }

    explanation = `Diferença total: ${formatCurrency(total.diff)}. ` + parts.join('. ');
  }

  return {
    subtotal,
    discounts,
    shipping,
    taxes,
    total,
    impact,
    explanation,
  };
}

// =============================================================================
// Análise de Preço
// =============================================================================

/**
 * Gera análise de preço explicando por que um orçamento é mais caro
 */
export function generatePriceAnalysis(
  budget1: NormalizedData,
  budget2: NormalizedData
): PriceAnalysis {
  const breakdown: PriceBreakdownItem[] = [];

  // 1. Diferença de subtotal (itens)
  const subtotalDiff = budget2.totals.subtotal - budget1.totals.subtotal;
  if (Math.abs(subtotalDiff) > 0.01) {
    breakdown.push({
      category: 'items',
      description: subtotalDiff > 0
        ? 'Itens mais caros ou em maior quantidade no Orçamento 2'
        : 'Itens mais baratos ou em menor quantidade no Orçamento 2',
      budget1Value: budget1.totals.subtotal,
      budget2Value: budget2.totals.subtotal,
      difference: subtotalDiff,
      impact: subtotalDiff > 0 ? 'expensive' : 'cheaper',
    });
  }

  // 2. Diferença de frete
  const shippingDiff = budget2.totals.shipping - budget1.totals.shipping;
  if (Math.abs(shippingDiff) > 0.01) {
    breakdown.push({
      category: 'shipping',
      description: shippingDiff > 0
        ? 'Frete mais caro no Orçamento 2'
        : 'Frete mais barato no Orçamento 2',
      budget1Value: budget1.totals.shipping,
      budget2Value: budget2.totals.shipping,
      difference: shippingDiff,
      impact: shippingDiff > 0 ? 'expensive' : 'cheaper',
    });
  }

  // 3. Diferença de descontos (invertido: mais desconto = mais barato)
  const discountsDiff = budget2.totals.discounts - budget1.totals.discounts;
  if (Math.abs(discountsDiff) > 0.01) {
    breakdown.push({
      category: 'discounts',
      description: discountsDiff > 0
        ? 'Mais descontos aplicados no Orçamento 2'
        : 'Menos descontos aplicados no Orçamento 2',
      budget1Value: budget1.totals.discounts,
      budget2Value: budget2.totals.discounts,
      difference: discountsDiff,
      // Mais desconto = mais barato
      impact: discountsDiff > 0 ? 'cheaper' : 'expensive',
    });
  }

  // 4. Diferença de impostos
  const taxesDiff = budget2.totals.taxes - budget1.totals.taxes;
  if (Math.abs(taxesDiff) > 0.01) {
    breakdown.push({
      category: 'taxes',
      description: taxesDiff > 0
        ? 'Mais impostos no Orçamento 2'
        : 'Menos impostos no Orçamento 2',
      budget1Value: budget1.totals.taxes,
      budget2Value: budget2.totals.taxes,
      difference: taxesDiff,
      impact: taxesDiff > 0 ? 'expensive' : 'cheaper',
    });
  }

  // Ordenar por impacto absoluto (maior primeiro)
  breakdown.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  // Determinar qual orçamento é mais barato
  const priceDifference = budget2.totals.total - budget1.totals.total;
  let cheaperBudget: 'budget1' | 'budget2' | 'equal' = 'equal';
  if (Math.abs(priceDifference) > 0.01) {
    cheaperBudget = priceDifference > 0 ? 'budget1' : 'budget2';
  }

  return {
    cheaperBudget,
    priceDifference,
    breakdown,
  };
}

// =============================================================================
// Geração de Resumo
// =============================================================================

/**
 * Gera o resumo geral da comparação Budget vs Budget
 */
export function generateBudgetComparisonSummary(
  itemDiffs: BudgetItemDiff[],
  totalsDiff: BudgetTotalsDiff,
  shippingDiff: ShippingDiff | null,
  promoDiffs: PromoDiff[],
  marketingTagDiffs: MarketingTagDiff[]
): BudgetComparisonSummary {
  // Contar divergências por nível
  const allImpacts: ImpactLevel[] = [
    ...itemDiffs.map((d) => d.impact),
    totalsDiff.impact,
    shippingDiff?.impact || 'none',
    ...promoDiffs.map((d) => d.impact),
    ...marketingTagDiffs.map((d) => d.impact),
  ];

  const criticalDiffs = allImpacts.filter((i) => i === 'critical').length;
  const highDiffs = allImpacts.filter((i) => i === 'high').length;
  const mediumDiffs = allImpacts.filter((i) => i === 'medium').length;
  const totalDiffs = allImpacts.filter((i) => i !== 'none').length;

  // Determinar criticidade geral
  let overallImpact: ImpactLevel = 'none';
  if (criticalDiffs > 0) {
    overallImpact = 'critical';
  } else if (highDiffs > 0) {
    overallImpact = 'high';
  } else if (mediumDiffs > 0) {
    overallImpact = 'medium';
  } else if (totalDiffs > 0) {
    overallImpact = 'low';
  }

  return {
    totalDiffs,
    criticalDiffs,
    highDiffs,
    mediumDiffs,
    financialDifference: totalsDiff.total.diff,
    overallImpact,
  };
}

// =============================================================================
// Comparação Completa
// =============================================================================

/**
 * Compara dois orçamentos normalizados e retorna o resultado completo
 * 
 * @param budget1 Primeiro orçamento normalizado
 * @param budget2 Segundo orçamento normalizado
 * @param skuWeights Mapa de SKU ID -> peso em kg
 * @param metadata Metadados da comparação
 * @returns Resultado completo da comparação
 */
export function compareBudgets(
  budget1: NormalizedData,
  budget2: NormalizedData,
  skuWeights: Map<string, number>,
  metadata: BudgetComparisonMetadata
): BudgetComparisonResult {
  // 1. Calcular informações de peso
  const budget1Weight = calculateWeightInfo(budget1.items, skuWeights);
  const budget2Weight = calculateWeightInfo(budget2.items, skuWeights);
  const weightInfo = compareWeights(budget1Weight, budget2Weight);

  // 2. Comparar itens
  const itemDiffs = compareBudgetItems(budget1.items, budget2.items, skuWeights);

  // 3. Comparar totais
  const totalsDiff = compareBudgetTotals(budget1.totals, budget2.totals);

  // 4. Comparar entrega
  const shippingDiff = compareShipping(budget1.shipping, budget2.shipping);

  // 5. Comparar promoções
  const promoDiffs = comparePromotions(budget1.promotions, budget2.promotions);

  // 6. Comparar marketing tags
  const budget1Tags = budget1.context?.marketingTags || [];
  const budget2Tags = budget2.context?.marketingTags || [];
  const marketingTagDiffs = compareMarketingTags(budget1Tags, budget2Tags);

  // 7. Gerar análise de preço
  const priceAnalysis = generatePriceAnalysis(budget1, budget2);

  // 8. Gerar resumo
  const summary = generateBudgetComparisonSummary(
    itemDiffs,
    totalsDiff,
    shippingDiff,
    promoDiffs,
    marketingTagDiffs
  );

  return {
    summary,
    itemDiffs,
    totalsDiff,
    shippingDiff,
    promoDiffs,
    priceAnalysis,
    weightInfo,
    marketingTagDiffs,
    metadata,
  };
}
