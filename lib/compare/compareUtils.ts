/**
 * Funções utilitárias para comparação de Budget vs OrderForm
 * 
 * Implementa a lógica de comparação e cálculo de divergências
 * com classificação de criticidade.
 */

import {
  NormalizedItem,
  NormalizedTotals,
  NormalizedShipping,
  NormalizedPromotion,
  ItemDiff,
  ItemDiffStatus,
  TotalsDiff,
  ShippingDiff,
  PromoDiff,
  MarketingTagDiff,
  ImpactLevel,
  ComparisonSummary,
} from './types';
import { getCriticalityThresholds } from '@/lib/vtex/config';

// =============================================================================
// Funções auxiliares
// =============================================================================

/**
 * Calcula diferença percentual entre dois valores
 */
export function calculatePercentageDiff(budget: number, cart: number): number {
  if (budget === 0) return cart === 0 ? 0 : 100;
  return ((cart - budget) / budget) * 100;
}

/**
 * Determina o nível de impacto baseado na diferença percentual e absoluta
 */
export function determineImpact(
  diffPct: number,
  diffAbs: number,
  thresholds?: { percentageThreshold: number; absoluteThreshold: number }
): ImpactLevel {
  const { percentageThreshold, absoluteThreshold } = thresholds || getCriticalityThresholds();

  const absDiffPct = Math.abs(diffPct);
  const absDiffAbs = Math.abs(diffAbs);

  // Crítico: acima dos thresholds configurados
  if (absDiffPct > percentageThreshold * 10 || absDiffAbs > absoluteThreshold * 2) {
    return 'critical';
  }

  // Alto: diferença significativa
  if (absDiffPct > 5 || absDiffAbs > absoluteThreshold) {
    return 'high';
  }

  // Médio: diferença moderada
  if (absDiffPct > 1 || absDiffAbs > absoluteThreshold / 2) {
    return 'medium';
  }

  // Baixo: diferença pequena mas existente
  if (absDiffPct > 0.1 || absDiffAbs > 0.01) {
    return 'low';
  }

  return 'none';
}

/**
 * Formata valor monetário em reais
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// =============================================================================
// Comparação de Itens
// =============================================================================

/**
 * Compara itens do orçamento com itens do carrinho
 * Identifica: matches, diferenças de quantidade/preço, itens faltantes/extras
 */
export function compareItems(
  budgetItems: NormalizedItem[],
  cartItems: NormalizedItem[]
): ItemDiff[] {
  const diffs: ItemDiff[] = [];
  const processedCartSkus = new Set<string>();

  // Para cada item do orçamento
  for (const budgetItem of budgetItems) {
    const cartItem = cartItems.find((item) => item.skuId === budgetItem.skuId);

    if (!cartItem) {
      // Item no orçamento mas não no carrinho
      diffs.push({
        skuId: budgetItem.skuId,
        name: budgetItem.name,
        status: 'missing_in_cart',
        budgetQty: budgetItem.quantity,
        budgetPrice: budgetItem.unitPrice,
        impact: 'critical',
        explanation: `Item "${budgetItem.name}" está no orçamento mas não foi adicionado ao carrinho. ` +
          `Valor previsto: ${formatCurrency(budgetItem.totalPrice)}.`,
      });
    } else {
      processedCartSkus.add(cartItem.skuId);
      const itemDiff = compareItemPair(budgetItem, cartItem);
      diffs.push(itemDiff);
    }
  }

  // Itens no carrinho que não estão no orçamento
  for (const cartItem of cartItems) {
    if (!processedCartSkus.has(cartItem.skuId)) {
      diffs.push({
        skuId: cartItem.skuId,
        name: cartItem.name,
        status: 'unexpected_in_cart',
        cartQty: cartItem.quantity,
        cartPrice: cartItem.unitPrice,
        impact: 'high',
        explanation: `Item "${cartItem.name}" foi adicionado ao carrinho mas não consta no orçamento. ` +
          `Valor adicional: ${formatCurrency(cartItem.totalPrice)}.`,
      });
    }
  }

  return diffs;
}

/**
 * Compara um par de itens (budget vs cart) do mesmo SKU
 */
function compareItemPair(budgetItem: NormalizedItem, cartItem: NormalizedItem): ItemDiff {
  const qtyDiff = cartItem.quantity - budgetItem.quantity;
  const priceDiff = cartItem.unitPrice - budgetItem.unitPrice;
  const priceDiffPct = calculatePercentageDiff(budgetItem.unitPrice, cartItem.unitPrice);

  const hasQtyDiff = qtyDiff !== 0;
  const hasPriceDiff = Math.abs(priceDiffPct) > 0.01;

  let status: ItemDiffStatus = 'match';
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
      parts.push(`Quantidade: orçamento ${budgetItem.quantity}, carrinho ${cartItem.quantity} (${qtyDiff > 0 ? '+' : ''}${qtyDiff})`);
    }
    if (hasPriceDiff) {
      parts.push(`Preço unitário: orçamento ${formatCurrency(budgetItem.unitPrice)}, carrinho ${formatCurrency(cartItem.unitPrice)} (${priceDiffPct > 0 ? '+' : ''}${priceDiffPct.toFixed(2)}%)`);
    }
    explanation = parts.join('. ');
  }

  return {
    skuId: budgetItem.skuId,
    name: budgetItem.name,
    status,
    budgetQty: budgetItem.quantity,
    cartQty: cartItem.quantity,
    budgetPrice: budgetItem.unitPrice,
    cartPrice: cartItem.unitPrice,
    priceDiffAbs: hasPriceDiff ? priceDiff : undefined,
    priceDiffPct: hasPriceDiff ? priceDiffPct : undefined,
    qtyDiffAbs: hasQtyDiff ? qtyDiff : undefined,
    impact,
    explanation,
  };
}

// =============================================================================
// Comparação de Totais
// =============================================================================

/**
 * Compara totais financeiros entre orçamento e carrinho
 */
export function compareTotals(
  budgetTotals: NormalizedTotals,
  cartTotals: NormalizedTotals
): TotalsDiff {
  const compareTotalField = (budget: number, cart: number) => ({
    budget,
    cart,
    diff: cart - budget,
    diffPct: calculatePercentageDiff(budget, cart),
  });

  const subtotal = compareTotalField(budgetTotals.subtotal, cartTotals.subtotal);
  const discounts = compareTotalField(budgetTotals.discounts, cartTotals.discounts);
  const shipping = compareTotalField(budgetTotals.shipping, cartTotals.shipping);
  const taxes = compareTotalField(budgetTotals.taxes, cartTotals.taxes);
  const total = compareTotalField(budgetTotals.total, cartTotals.total);

  const financialImpact = total.diff;
  const impact = determineImpact(total.diffPct, total.diff);

  let explanation: string | undefined;
  if (impact !== 'none') {
    const parts: string[] = [];

    if (Math.abs(subtotal.diffPct) > 0.1) {
      parts.push(`Subtotal ${subtotal.diff > 0 ? 'maior' : 'menor'}: ${formatCurrency(Math.abs(subtotal.diff))}`);
    }
    if (Math.abs(discounts.diff) > 0.01) {
      parts.push(`Descontos ${discounts.diff > 0 ? 'maiores' : 'menores'}: ${formatCurrency(Math.abs(discounts.diff))}`);
    }
    if (Math.abs(shipping.diff) > 0.01) {
      parts.push(`Frete ${shipping.diff > 0 ? 'maior' : 'menor'}: ${formatCurrency(Math.abs(shipping.diff))}`);
    }

    explanation = `Diferença total: ${formatCurrency(financialImpact)}. ` + parts.join('. ');
  }

  return {
    subtotal,
    discounts,
    shipping,
    taxes,
    total,
    financialImpact,
    impact,
    explanation,
  };
}

// =============================================================================
// Comparação de Entrega
// =============================================================================

/**
 * Mapeamento de tipos de entrega do Carrinho para Orçamento
 * 
 * Carrinho (selectedSla)    -> Orçamento (deliveryType/shippingType)
 * ---------------------------------------------------------------
 * AMARANZ LOGISTICA CAJ     -> PDO/CIF
 * AMARANZ LOGISTICA FSA     -> PDO/CIF
 * EXP LOGISTICA CAJ         -> EXP/CIF
 * EXP LOGISTICA FSA         -> EXP/CIF
 * FOB LOGISTICA CAJ         -> PDO/FOB
 * FOB LOGISTICA FSA         -> PDO/FOB
 */
interface BudgetDeliveryMapping {
  deliveryType: string;
  shippingType: string;
}

const CART_TO_BUDGET_DELIVERY_MAP: Record<string, BudgetDeliveryMapping> = {
  'AMARANZ LOGISTICA CAJ': { deliveryType: 'PDO', shippingType: 'CIF' },
  'AMARANZ LOGISTICA FSA': { deliveryType: 'PDO', shippingType: 'CIF' },
  'EXP LOGISTICA CAJ': { deliveryType: 'EXP', shippingType: 'CIF' },
  'EXP LOGISTICA FSA': { deliveryType: 'EXP', shippingType: 'CIF' },
  'FOB LOGISTICA CAJ': { deliveryType: 'PDO', shippingType: 'FOB' },
  'FOB LOGISTICA FSA': { deliveryType: 'PDO', shippingType: 'FOB' },
};

/**
 * Converte o tipo de entrega do carrinho para o formato do orçamento
 */
function mapCartDeliveryTypeToBudget(cartDeliveryType: string): BudgetDeliveryMapping | null {
  // Normalizar para uppercase e remover espaços extras
  const normalized = cartDeliveryType.trim().toUpperCase();

  // Buscar no mapeamento
  for (const [cartType, budgetMapping] of Object.entries(CART_TO_BUDGET_DELIVERY_MAP)) {
    if (normalized === cartType.toUpperCase()) {
      return budgetMapping;
    }
  }

  return null;
}

/**
 * Verifica se os tipos de entrega são equivalentes
 * Compara o tipo do carrinho (mapeado) com o tipo do orçamento
 */
function areDeliveryTypesEquivalent(
  cartDeliveryType: string,
  budgetDeliveryType: string
): boolean {
  // Mapear o tipo do carrinho para o formato do orçamento
  const mappedCart = mapCartDeliveryTypeToBudget(cartDeliveryType);

  if (!mappedCart) {
    // Se não encontrou mapeamento, faz comparação direta (case insensitive)
    return cartDeliveryType.toLowerCase() === budgetDeliveryType.toLowerCase();
  }

  // O budgetDeliveryType pode estar no formato "PDO/CIF" ou separado
  const budgetNormalized = budgetDeliveryType.toUpperCase();

  // Verifica se o budget contém os dois componentes
  const hasDeliveryType = budgetNormalized.includes(mappedCart.deliveryType);
  const hasShippingType = budgetNormalized.includes(mappedCart.shippingType);

  // Se o budget tem ambos os componentes no formato combinado
  if (hasDeliveryType && hasShippingType) {
    return true;
  }

  // Se o budget só tem deliveryType, compara só isso
  if (budgetNormalized === mappedCart.deliveryType) {
    return true;
  }

  // Formato "deliveryType/shippingType"
  const expectedFormat = `${mappedCart.deliveryType}/${mappedCart.shippingType}`;
  return budgetNormalized === expectedFormat;
}

/**
 * Formata o tipo de entrega do carrinho para exibição
 * Inclui o mapeamento para o formato do orçamento
 */
function formatCartDeliveryType(cartDeliveryType: string): string {
  const mapped = mapCartDeliveryTypeToBudget(cartDeliveryType);
  if (mapped) {
    return `${cartDeliveryType} (${mapped.deliveryType}/${mapped.shippingType})`;
  }
  return cartDeliveryType;
}

/**
 * Compara dados de entrega entre orçamento e carrinho
 */
export function compareShipping(
  budgetShipping: NormalizedShipping | null,
  cartShipping: NormalizedShipping | null
): ShippingDiff | null {
  // Se nenhum tem dados de shipping
  if (!budgetShipping && !cartShipping) {
    return null;
  }

  // Se apenas um tem dados
  if (!budgetShipping || !cartShipping) {
    return {
      postalCodeDiff: true,
      budgetPostalCode: budgetShipping?.postalCode,
      cartPostalCode: cartShipping?.postalCode,
      deliveryTypeDiff: true,
      budgetDeliveryType: budgetShipping?.deliveryType,
      cartDeliveryType: cartShipping?.deliveryType,
      shippingValueDiff: {
        budget: budgetShipping?.shippingValue || 0,
        cart: cartShipping?.shippingValue || 0,
        diff: (cartShipping?.shippingValue || 0) - (budgetShipping?.shippingValue || 0),
        diffPct: 100,
      },
      impact: 'high',
      explanation: budgetShipping
        ? 'Dados de entrega do carrinho não encontrados.'
        : 'Orçamento sem dados de entrega para comparação.',
    };
  }

  // Comparar CEPs (normalizados)
  const postalCodeDiff = normalizePostalCode(budgetShipping.postalCode) !==
    normalizePostalCode(cartShipping.postalCode);

  // Comparar tipos de entrega usando o mapeamento
  const deliveryTypeDiff = !areDeliveryTypesEquivalent(
    cartShipping.deliveryType,
    budgetShipping.deliveryType
  );

  const shippingValueDiff = {
    budget: budgetShipping.shippingValue,
    cart: cartShipping.shippingValue,
    diff: cartShipping.shippingValue - budgetShipping.shippingValue,
    diffPct: calculatePercentageDiff(budgetShipping.shippingValue, cartShipping.shippingValue),
  };

  // Determinar impacto
  let impact: ImpactLevel = 'none';
  const explanationParts: string[] = [];

  if (postalCodeDiff) {
    impact = 'high';
    explanationParts.push(
      `CEP diferente: orçamento ${budgetShipping.postalCode || '(não informado)'}, ` +
      `carrinho ${cartShipping.postalCode || '(não informado)'}. ` +
      `Isso pode afetar valor do frete e prazo de entrega.`
    );
  }

  if (deliveryTypeDiff) {
    if (impact === 'none') impact = 'medium';
    const cartFormatted = formatCartDeliveryType(cartShipping.deliveryType);
    explanationParts.push(
      `Tipo de entrega diferente: orçamento "${budgetShipping.deliveryType}", ` +
      `carrinho "${cartFormatted}".`
    );
  }

  if (Math.abs(shippingValueDiff.diff) > 0.01) {
    const valueImpact = determineImpact(shippingValueDiff.diffPct, shippingValueDiff.diff);
    if (valueImpact !== 'none' && (impact === 'none' || valueImpact === 'critical')) {
      impact = valueImpact;
    }
    explanationParts.push(
      `Frete ${shippingValueDiff.diff > 0 ? 'maior' : 'menor'} no carrinho: ` +
      `${formatCurrency(Math.abs(shippingValueDiff.diff))} (${shippingValueDiff.diffPct > 0 ? '+' : ''}${shippingValueDiff.diffPct.toFixed(2)}%).`
    );
  }

  return {
    postalCodeDiff,
    budgetPostalCode: budgetShipping.postalCode,
    cartPostalCode: cartShipping.postalCode,
    deliveryTypeDiff,
    budgetDeliveryType: budgetShipping.deliveryType,
    cartDeliveryType: cartShipping.deliveryType,
    shippingValueDiff,
    impact,
    explanation: explanationParts.length > 0 ? explanationParts.join(' ') : undefined,
  };
}

/**
 * Normaliza CEP removendo caracteres especiais
 */
function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/\D/g, '');
}

// =============================================================================
// Comparação de Promoções
// =============================================================================

/**
 * Compara promoções entre orçamento e carrinho
 */
export function comparePromotions(
  budgetPromos: NormalizedPromotion[],
  cartPromos: NormalizedPromotion[]
): PromoDiff[] {
  const diffs: PromoDiff[] = [];
  const processedCartPromoIds = new Set<string>();

  // Para cada promoção do orçamento
  for (const budgetPromo of budgetPromos) {
    const cartPromo = cartPromos.find((p) => p.id === budgetPromo.id);

    if (!cartPromo) {
      // Promoção prevista mas não aplicada
      diffs.push({
        id: budgetPromo.id,
        name: budgetPromo.name,
        status: 'only_in_budget',
        budgetValue: budgetPromo.value,
        impact: 'medium',
        explanation: `Promoção "${budgetPromo.name}" estava prevista no orçamento ` +
          `(${formatCurrency(budgetPromo.value)}) mas não foi aplicada no carrinho.`,
      });
    } else {
      processedCartPromoIds.add(cartPromo.id);

      // Comparar valores se ambos existem
      if (budgetPromo.value > 0 && cartPromo.value > 0) {
        const valueDiff = cartPromo.value - budgetPromo.value;
        if (Math.abs(valueDiff) > 0.01) {
          diffs.push({
            id: budgetPromo.id,
            name: budgetPromo.name,
            status: 'value_diff',
            budgetValue: budgetPromo.value,
            cartValue: cartPromo.value,
            valueDiff,
            impact: 'low',
            explanation: `Promoção "${budgetPromo.name}" com valor diferente: ` +
              `orçamento ${formatCurrency(budgetPromo.value)}, carrinho ${formatCurrency(cartPromo.value)}.`,
          });
        } else {
          diffs.push({
            id: budgetPromo.id,
            name: budgetPromo.name,
            status: 'match',
            budgetValue: budgetPromo.value,
            cartValue: cartPromo.value,
            impact: 'none',
          });
        }
      } else {
        // Match sem comparação de valor
        diffs.push({
          id: budgetPromo.id,
          name: budgetPromo.name,
          status: 'match',
          impact: 'none',
        });
      }
    }
  }

  // Promoções no carrinho que não estão no orçamento
  for (const cartPromo of cartPromos) {
    if (!processedCartPromoIds.has(cartPromo.id)) {
      diffs.push({
        id: cartPromo.id,
        name: cartPromo.name,
        status: 'only_in_cart',
        cartValue: cartPromo.value,
        impact: cartPromo.value > 0 ? 'medium' : 'low',
        explanation: `Promoção "${cartPromo.name}" aplicada no carrinho mas não estava prevista no orçamento. ` +
          (cartPromo.value > 0
            ? `Desconto adicional de ${formatCurrency(cartPromo.value)}.`
            : 'Verifique se é uma promoção válida.'),
      });
    }
  }

  return diffs;
}

// =============================================================================
// Comparação de Marketing Tags
// =============================================================================

/**
 * Tag específica da Bonifiq para uso de pontos
 */
export const BONIFIQ_TAG = 'usar-pontos-agora';

/**
 * Verifica se uma marketing tag específica está presente
 * 
 * @param tag Tag a verificar
 * @param budgetTags Tags do orçamento
 * @param cartTags Tags do carrinho
 * @returns Resultado da verificação
 */
export function checkMarketingTag(
  tag: string,
  budgetTags: string[],
  cartTags: string[]
): { inBudget: boolean; inCart: boolean; match: boolean } {
  const normalizedTag = tag.trim().toLowerCase();
  const inBudget = budgetTags.some(t => t.toLowerCase() === normalizedTag);
  const inCart = cartTags.some(t => t.toLowerCase() === normalizedTag);

  return {
    inBudget,
    inCart,
    match: inBudget === inCart,
  };
}

/**
 * Compara marketing tags entre orçamento e carrinho
 * Identifica tags presentes em um mas não no outro
 * 
 * @param budgetTags Tags do orçamento
 * @param cartTags Tags do carrinho
 * @param tagsToCheck Tags específicas para verificar (ex: Bonifiq)
 * @returns Array de diferenças de marketing tags
 */
export function compareMarketingTags(
  budgetTags: string[],
  cartTags: string[],
  tagsToCheck: string[] = [BONIFIQ_TAG]
): MarketingTagDiff[] {
  const diffs: MarketingTagDiff[] = [];

  // Normalizar tags
  const normalizedBudgetTags = budgetTags.map(t => t.trim().toLowerCase());
  const normalizedCartTags = cartTags.map(t => t.trim().toLowerCase());

  // Verificar tags específicas
  for (const tag of tagsToCheck) {
    const normalizedTag = tag.trim().toLowerCase();
    const check = checkMarketingTag(normalizedTag, normalizedBudgetTags, normalizedCartTags);

    // Só adiciona se há divergência ou se a tag está presente
    if (check.inBudget || check.inCart) {
      let impact: ImpactLevel = 'none';
      let explanation: string | undefined;

      if (!check.match) {
        if (check.inBudget && !check.inCart) {
          // Tag no orçamento mas não no carrinho - promoção pode não ser aplicada
          impact = 'high';
          explanation = `Tag "${tag}" está no orçamento mas não foi aplicada no carrinho. ` +
            'A promoção associada pode não ser aplicada corretamente.';
        } else if (!check.inBudget && check.inCart) {
          // Tag no carrinho mas não no orçamento - promoção extra
          impact = 'medium';
          explanation = `Tag "${tag}" foi aplicada no carrinho mas não estava prevista no orçamento.`;
        }
      }

      diffs.push({
        tag,
        inBudget: check.inBudget,
        inCart: check.inCart,
        match: check.match,
        impact,
        explanation,
      });
    }
  }

  // Verificar tags do orçamento que não estão nas tags específicas
  for (const budgetTag of normalizedBudgetTags) {
    const isSpecificTag = tagsToCheck.some(t => t.toLowerCase() === budgetTag);
    if (isSpecificTag) continue; // Já verificada acima

    const inCart = normalizedCartTags.includes(budgetTag);

    if (!inCart) {
      diffs.push({
        tag: budgetTag,
        inBudget: true,
        inCart: false,
        match: false,
        impact: 'low',
        explanation: `Tag "${budgetTag}" no orçamento não encontrada no carrinho.`,
      });
    }
  }

  // Verificar tags do carrinho que não estão no orçamento
  for (const cartTag of normalizedCartTags) {
    const isSpecificTag = tagsToCheck.some(t => t.toLowerCase() === cartTag);
    if (isSpecificTag) continue; // Já verificada acima

    const inBudget = normalizedBudgetTags.includes(cartTag);

    if (!inBudget) {
      diffs.push({
        tag: cartTag,
        inBudget: false,
        inCart: true,
        match: false,
        impact: 'low',
        explanation: `Tag "${cartTag}" no carrinho não estava no orçamento.`,
      });
    }
  }

  return diffs;
}

/**
 * Verifica especificamente a tag da Bonifiq
 * Retorna resultado detalhado para a promoção "usar-pontos-agora"
 * 
 * @param budgetTags Tags do orçamento
 * @param cartTags Tags do carrinho
 * @returns Resultado da verificação da tag Bonifiq
 */
export function checkBonifiqTag(
  budgetTags: string[],
  cartTags: string[]
): MarketingTagDiff {
  const check = checkMarketingTag(BONIFIQ_TAG, budgetTags, cartTags);

  let impact: ImpactLevel = 'none';
  let explanation: string | undefined;

  if (!check.match) {
    if (check.inBudget && !check.inCart) {
      impact = 'high';
      explanation = 'Bonifiq: Tag "usar-pontos-agora" está no orçamento mas não no carrinho. ' +
        'O cliente pode não conseguir usar os pontos Bonifiq.';
    } else if (!check.inBudget && check.inCart) {
      impact = 'medium';
      explanation = 'Bonifiq: Tag "usar-pontos-agora" aplicada no carrinho mas não prevista no orçamento.';
    }
  } else if (check.inBudget && check.inCart) {
    explanation = 'Bonifiq: Tag "usar-pontos-agora" presente em ambos - pontos podem ser utilizados.';
  }

  return {
    tag: BONIFIQ_TAG,
    inBudget: check.inBudget,
    inCart: check.inCart,
    match: check.match,
    impact,
    explanation,
  };
}

// =============================================================================
// Geração de Resumo
// =============================================================================

/**
 * Gera o resumo geral da comparação
 */
export function generateSummary(
  itemDiffs: ItemDiff[],
  totalsDiff: TotalsDiff,
  shippingDiff: ShippingDiff | null,
  promoDiffs: PromoDiff[],
  marketingTagDiffs: MarketingTagDiff[] = []
): ComparisonSummary {
  // Contar divergências por nível
  const allImpacts = [
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
    financialImpact: totalsDiff.financialImpact,
    overallImpact,
  };
}
