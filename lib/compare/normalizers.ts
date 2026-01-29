/**
 * Funções de normalização para Budget e OrderForm
 * 
 * Converte as estruturas específicas da VTEX em uma estrutura
 * normalizada comum para facilitar a comparação.
 */

import {
  VTEXOrderForm,
  VTEXBudget,
  NormalizedData,
  NormalizedItem,
  NormalizedTotals,
  NormalizedShipping,
  NormalizedPromotion,
} from './types';

/**
 * Converte centavos para reais
 * A API VTEX retorna valores monetários em centavos (integer)
 */
export function centavosToReais(centavos: number): number {
  return centavos / 100;
}

/**
 * Normaliza um OrderForm da VTEX para a estrutura comum
 * 
 * @param orderForm Dados do OrderForm da API VTEX
 * @returns Estrutura normalizada
 */
export function normalizeOrderForm(orderForm: VTEXOrderForm): NormalizedData {
  // Normalizar itens
  const items: NormalizedItem[] = orderForm.items.map((item) => ({
    skuId: item.id,
    name: item.name,
    quantity: item.quantity,
    // Preços em centavos -> reais
    unitPrice: centavosToReais(item.sellingPrice || item.price),
    totalPrice: centavosToReais((item.sellingPrice || item.price) * item.quantity),
    sellerId: item.seller,
    refId: item.refId,
    imageUrl: item.imageUrl,
  }));

  // Normalizar totais a partir dos totalizers
  const totals = normalizeTotalizersToTotals(orderForm.totalizers, orderForm.value);

  // Normalizar shipping
  const shipping = normalizeOrderFormShipping(orderForm);

  // Normalizar promoções
  const promotions = normalizeOrderFormPromotions(orderForm);

  // Extrair marketing tags
  const marketingTags = extractOrderFormMarketingTags(orderForm);

  return {
    items,
    totals,
    shipping,
    promotions,
    context: {
      marketingTags,
    },
  };
}

/**
 * Converte os totalizers da VTEX para estrutura de totais
 */
function normalizeTotalizersToTotals(
  totalizers: VTEXOrderForm['totalizers'],
  totalValue: number
): NormalizedTotals {
  const findTotalizer = (id: string): number => {
    const found = totalizers?.find((t) => t.id === id);
    return found ? centavosToReais(found.value) : 0;
  };

  return {
    subtotal: findTotalizer('Items'),
    discounts: Math.abs(findTotalizer('Discounts')), // Descontos são negativos na VTEX
    shipping: findTotalizer('Shipping'),
    taxes: findTotalizer('Tax'),
    total: centavosToReais(totalValue),
  };
}

/**
 * Normaliza dados de shipping do OrderForm
 * 
 * O valor do frete vem do totalizer "Shipping" (em centavos)
 * O tipo de entrega vem do selectedSla no logisticsInfo
 */
function normalizeOrderFormShipping(orderForm: VTEXOrderForm): NormalizedShipping | null {
  const shippingData = orderForm.shippingData;
  if (!shippingData) return null;

  const address = shippingData.address || shippingData.selectedAddresses?.[0];
  const logistics = shippingData.logisticsInfo?.[0];

  // Valor do frete vem do totalizer "Shipping" (mais confiável)
  const shippingTotalizer = orderForm.totalizers?.find(t => t.id === 'Shipping');
  const shippingValue = shippingTotalizer?.value || 0;

  return {
    postalCode: address?.postalCode || '',
    deliveryType: logistics?.selectedSla || logistics?.selectedDeliveryChannel || 'unknown',
    shippingValue: centavosToReais(shippingValue),
    pickupPoint: logistics?.slas?.find(s => s.deliveryChannel === 'pickup-in-point')?.pickupStoreInfo?.friendlyName,
    address: address ? {
      street: address.street || '',
      number: address.number || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
    } : undefined,
  };
}

/**
 * Normaliza promoções do OrderForm
 */
function normalizeOrderFormPromotions(orderForm: VTEXOrderForm): NormalizedPromotion[] {
  const ratesAndBenefits = orderForm.ratesAndBenefitsData?.rateAndBenefitsIdentifiers || [];

  return ratesAndBenefits.map((promo) => ({
    id: promo.id,
    name: promo.name,
    // Valor da promoção não vem diretamente nos ratesAndBenefits
    // Seria necessário calcular a partir dos descontos por item
    value: 0, // TODO: Calcular valor real se necessário
    type: 'benefit',
  }));
}

/**
 * Extrai marketing tags do OrderForm
 * 
 * As tags podem estar em dois lugares:
 * 1. marketingData.marketingTags (array direto)
 * 2. ratesAndBenefitsData.rateAndBenefitsIdentifiers[].matchedParameters.marketingTags (string)
 * 
 * @param orderForm OrderForm da VTEX
 * @returns Array de marketing tags únicas
 */
function extractOrderFormMarketingTags(orderForm: VTEXOrderForm): string[] {
  const tags = new Set<string>();

  // 1. Extrair de marketingData.marketingTags
  if (orderForm.marketingData?.marketingTags) {
    for (const tag of orderForm.marketingData.marketingTags) {
      if (tag) tags.add(tag.trim().toLowerCase());
    }
  }

  // 2. Extrair de ratesAndBenefitsData.rateAndBenefitsIdentifiers[].matchedParameters.marketingTags
  const ratesAndBenefits = orderForm.ratesAndBenefitsData?.rateAndBenefitsIdentifiers || [];
  for (const benefit of ratesAndBenefits) {
    const marketingTagsStr = benefit.matchedParameters?.marketingTags;
    if (marketingTagsStr) {
      // Pode vir como string separada por vírgula ou ponto-e-vírgula
      const parsedTags = marketingTagsStr.split(/[,;]/).map(t => t.trim().toLowerCase()).filter(Boolean);
      for (const tag of parsedTags) {
        tags.add(tag);
      }
    }
  }

  return Array.from(tags);
}

/**
 * Normaliza um Budget do Master Data para a estrutura comum
 * 
 * NOTA: A estrutura do Budget depende de como foi configurada
 * a entidade no Master Data. Esta função assume uma estrutura
 * padrão - adapte conforme necessário.
 * 
 * @param budget Dados do Budget do Master Data
 * @returns Estrutura normalizada
 */
export function normalizeBudget(budget: VTEXBudget): NormalizedData {
  // Determinar se os preços do budget estão em centavos ou reais
  // Assumindo que budget armazena em reais (ajuste se necessário)
  const priceMultiplier = detectBudgetPriceFormat(budget);

  // Normalizar itens
  // Usar sellingPrice para comparação (prioridade sobre price)
  const items: NormalizedItem[] = budget.items.map((item) => {
    // sellingPrice tem prioridade (preço de venda com descontos)
    const unitPrice = (item.sellingPrice ?? item.price) * priceMultiplier;
    const totalPrice = item.totalPrice
      ? item.totalPrice * priceMultiplier
      : unitPrice * item.quantity;

    return {
      skuId: item.skuId,
      name: item.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      sellerId: item.sellerId,
      refId: item.refId,
      imageUrl: item.imageUrl,
    };
  });

  // Normalizar totais
  const totals = normalizeBudgetTotals(budget, priceMultiplier);

  // Normalizar shipping
  const shipping = normalizeBudgetShipping(budget, priceMultiplier);

  // Normalizar promoções
  const promotions = normalizeBudgetPromotions(budget, priceMultiplier);

  // Extrair marketing tags do orçamento
  const marketingTags = extractBudgetMarketingTags(budget);

  return {
    items,
    totals,
    shipping,
    promotions,
    context: {
      ...budget.context,
      marketingTags,
    },
  };
}

/**
 * Detecta se os preços do Budget estão em centavos ou reais
 * Heurística: se o preço médio > 1000, provavelmente está em centavos
 */
function detectBudgetPriceFormat(budget: VTEXBudget): number {
  if (!budget.items?.length) return 1;

  const avgPrice = budget.items.reduce((sum, item) => sum + item.price, 0) / budget.items.length;

  // Se preço médio > 1000, assume centavos
  if (avgPrice > 1000) {
    console.log('[Normalizer] Detectado: Budget com preços em centavos');
    return 0.01; // Converte centavos para reais
  }

  return 1; // Já está em reais
}

/**
 * Calcula o total de descontos a partir dos priceTags dos itens
 * 
 * Os priceTags são usados pela VTEX para representar descontos e ajustes.
 * Valores negativos indicam descontos.
 * 
 * @param items Array de itens do orçamento
 * @returns Soma absoluta dos valores negativos dos priceTags
 */
function calculateDiscountsFromPriceTags(items: VTEXBudget['items']): number {
  let totalDiscount = 0;

  for (const item of items) {
    if (item.priceTags && Array.isArray(item.priceTags)) {
      for (const priceTag of item.priceTags) {
        // Valores negativos são descontos
        if (priceTag.value < 0) {
          totalDiscount += Math.abs(priceTag.value);
        }
      }
    }
  }

  return totalDiscount;
}

/**
 * Normaliza totais do Budget
 * 
 * O valor do frete no orçamento:
 * - shipping: valor base (CIF/PDO)
 * - shippingDeliveryValue: diferença para EXP (se aplicável)
 * 
 * O valor do desconto (prioridade):
 * 1. Soma dos priceTags negativos dos itens
 * 2. Campo "discounts" direto no orçamento
 * 3. totals.discount
 */
function normalizeBudgetTotals(budget: VTEXBudget, priceMultiplier: number): NormalizedTotals {
  const budgetTotals = budget.totals;

  // Calcular valor do frete
  let shippingValue = 0;

  if (typeof budget.shipping === 'number') {
    shippingValue = budget.shipping;
    // Se for EXP, adicionar shippingDeliveryValue
    if (budget.deliveryType === 'EXP' && budget.shippingDeliveryValue) {
      shippingValue += budget.shippingDeliveryValue;
    }
  } else if (budgetTotals?.shipping) {
    shippingValue = budgetTotals.shipping;
  } else if (budget.shippingData?.shippingValue) {
    shippingValue = budget.shippingData.shippingValue;
  }

  // Calcular valor do desconto
  // Prioridade: priceTags dos itens > campo "discounts" > totals.discount
  let discountsValue = 0;

  // 1. Tentar calcular a partir dos priceTags dos itens
  const priceTagsDiscount = calculateDiscountsFromPriceTags(budget.items);

  if (priceTagsDiscount > 0) {
    discountsValue = priceTagsDiscount;
    console.log(`[Normalizer] Desconto calculado via priceTags: ${discountsValue}`);
  } else if (typeof budget.discounts === 'number') {
    // 2. Campo "discounts" direto
    discountsValue = budget.discounts;
  } else if (budgetTotals?.discount) {
    // 3. Fallback para totals.discount
    discountsValue = budgetTotals.discount;
  }

  if (budgetTotals) {
    return {
      subtotal: (budgetTotals.subtotal || 0) * priceMultiplier,
      discounts: discountsValue * priceMultiplier,
      shipping: shippingValue * priceMultiplier,
      taxes: (budgetTotals.tax || 0) * priceMultiplier,
      total: budgetTotals.total * priceMultiplier,
    };
  }

  // Calcula totais a partir dos itens se não existir
  const subtotal = budget.items.reduce(
    (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
    0
  ) * priceMultiplier;

  return {
    subtotal,
    discounts: discountsValue * priceMultiplier,
    shipping: shippingValue * priceMultiplier,
    taxes: 0,
    total: subtotal - discountsValue * priceMultiplier + shippingValue * priceMultiplier,
  };
}

/**
 * Extrai o CEP do campo address do orçamento
 */
function extractPostalCodeFromAddress(address?: { postalCode?: string }): string {
  if (!address?.postalCode) return '';
  return String(address.postalCode).replace(/\D/g, '');
}

/**
 * Normaliza o tipo de entrega do orçamento
 * Combina deliveryType e shippingType
 */
function normalizeBudgetDeliveryType(budget: VTEXBudget): string {
  const parts: string[] = [];

  if (budget.deliveryType) {
    parts.push(budget.deliveryType);
  }

  if (budget.shippingType) {
    parts.push(budget.shippingType);
  }

  return parts.length > 0 ? parts.join('/') : 'unknown';
}

/**
 * Normaliza shipping do Budget
 * 
 * - CEP: extraído do campo "address"
 * - Tipo de entrega: combinação de deliveryType + shippingType
 * - Valor do frete: campo "shipping" (base) + "shippingDeliveryValue" se EXP
 */
function normalizeBudgetShipping(
  budget: VTEXBudget,
  priceMultiplier: number
): NormalizedShipping | null {
  // Extrair CEP do campo address (prioridade)
  const postalCode = extractPostalCodeFromAddress(budget.address) ||
    budget.shippingData?.postalCode ||
    '';

  // Se não tem dados de shipping nem CEP, retorna null
  const hasShippingData = budget.shipping !== undefined ||
    budget.shippingType ||
    budget.deliveryType ||
    budget.address ||
    postalCode;

  if (!hasShippingData && !budget.shippingData) return null;

  // Calcular valor do frete
  // shipping = valor base (CIF/PDO)
  // shippingDeliveryValue = diferença para EXP
  let shippingValue = 0;

  if (typeof budget.shipping === 'number') {
    shippingValue = budget.shipping;

    // Se for entrega expressa (EXP), adicionar shippingDeliveryValue
    if (budget.deliveryType === 'EXP' && budget.shippingDeliveryValue) {
      shippingValue += budget.shippingDeliveryValue;
    }
  } else if (budget.shippingData?.shippingValue) {
    // Fallback para estrutura legada
    shippingValue = budget.shippingData.shippingValue;
  }

  // Tipo de entrega normalizado
  const deliveryType = normalizeBudgetDeliveryType(budget) ||
    budget.shippingData?.deliveryType ||
    'unknown';

  // Usar address do orçamento ou shippingData como fallback
  const addressData = budget.address || budget.shippingData?.address;

  return {
    postalCode,
    deliveryType,
    shippingValue: shippingValue * priceMultiplier,
    address: addressData ? {
      street: addressData.street || '',
      number: addressData.number || '',
      neighborhood: addressData.neighborhood || '',
      city: addressData.city || '',
      state: addressData.state || '',
    } : undefined,
  };
}

/**
 * Normaliza promoções do Budget
 */
function normalizeBudgetPromotions(
  budget: VTEXBudget,
  priceMultiplier: number
): NormalizedPromotion[] {
  if (!budget.promotions) return [];

  return budget.promotions.map((promo) => ({
    id: promo.id,
    name: promo.name,
    value: promo.value * priceMultiplier,
  }));
}

/**
 * Extrai marketing tags do Budget
 * 
 * @param budget Budget do Master Data
 * @returns Array de marketing tags normalizadas (lowercase)
 */
function extractBudgetMarketingTags(budget: VTEXBudget): string[] {
  if (!budget.marketingTags || !Array.isArray(budget.marketingTags)) {
    return [];
  }

  return budget.marketingTags
    .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
    .map(tag => tag.trim().toLowerCase());
}
