/**
 * Testes unitários para compareUtils
 */

import { describe, it, expect } from 'vitest';
import {
  compareItems,
  compareTotals,
  compareShipping,
  comparePromotions,
  calculatePercentageDiff,
  determineImpact,
  generateSummary,
} from '@/lib/compare/compareUtils';
import { mockBudgetNormalized } from './mocks/budget.mock';
import {
  mockOrderFormNormalized,
  mockOrderFormMissingItem,
  mockOrderFormExtraItem,
  mockOrderFormDifferentCEP,
} from './mocks/orderForm.mock';

describe('calculatePercentageDiff', () => {
  it('deve calcular diferença percentual corretamente', () => {
    expect(calculatePercentageDiff(100, 110)).toBeCloseTo(10);
    expect(calculatePercentageDiff(100, 90)).toBeCloseTo(-10);
    expect(calculatePercentageDiff(100, 100)).toBe(0);
  });

  it('deve retornar 0 quando ambos são zero', () => {
    expect(calculatePercentageDiff(0, 0)).toBe(0);
  });

  it('deve retornar 100 quando budget é zero e cart não', () => {
    expect(calculatePercentageDiff(0, 100)).toBe(100);
  });
});

describe('determineImpact', () => {
  it('deve retornar none para diferenças insignificantes', () => {
    expect(determineImpact(0.05, 0.005)).toBe('none');
  });

  it('deve retornar low para diferenças pequenas', () => {
    expect(determineImpact(0.5, 1)).toBe('low');
  });

  it('deve retornar medium para diferenças moderadas', () => {
    expect(determineImpact(2, 30)).toBe('medium');
  });

  it('deve retornar high para diferenças significativas', () => {
    expect(determineImpact(6, 60)).toBe('high');
  });

  it('deve retornar critical para diferenças muito grandes', () => {
    expect(determineImpact(10, 150)).toBe('critical');
  });
});

describe('compareItems', () => {
  it('deve identificar itens iguais', () => {
    const result = compareItems(
      [mockBudgetNormalized.items[0]],
      [mockOrderFormNormalized.items[0]]
    );

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('match');
    expect(result[0].impact).toBe('none');
  });

  it('deve identificar diferença de preço', () => {
    const result = compareItems(
      [mockBudgetNormalized.items[1]], // preço 149.90
      [mockOrderFormNormalized.items[1]] // preço 159.90
    );

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('price_diff');
    expect(result[0].priceDiffAbs).toBeCloseTo(10);
    expect(result[0].impact).not.toBe('none');
  });

  it('deve identificar item faltando no carrinho', () => {
    const result = compareItems(
      mockBudgetNormalized.items,
      mockOrderFormMissingItem.items
    );

    const missingItem = result.find(r => r.status === 'missing_in_cart');
    expect(missingItem).toBeDefined();
    expect(missingItem?.skuId).toBe('SKU002');
    expect(missingItem?.impact).toBe('critical');
  });

  it('deve identificar item extra no carrinho', () => {
    const result = compareItems(
      mockBudgetNormalized.items,
      mockOrderFormExtraItem.items
    );

    const extraItem = result.find(r => r.status === 'unexpected_in_cart');
    expect(extraItem).toBeDefined();
    expect(extraItem?.skuId).toBe('SKU003');
    expect(extraItem?.impact).toBe('high');
  });

  it('deve identificar diferença de quantidade', () => {
    const budgetItem = { ...mockBudgetNormalized.items[0], quantity: 3 };
    const cartItem = { ...mockOrderFormNormalized.items[0], quantity: 2 };

    const result = compareItems([budgetItem], [cartItem]);

    expect(result[0].status).toBe('quantity_diff');
    expect(result[0].qtyDiffAbs).toBe(-1);
  });
});

describe('compareTotals', () => {
  it('deve comparar totais corretamente', () => {
    const result = compareTotals(
      mockBudgetNormalized.totals,
      mockOrderFormNormalized.totals
    );

    expect(result.subtotal.diff).toBeCloseTo(10); // 359.70 - 349.70
    expect(result.shipping.diff).toBeCloseTo(3); // 18 - 15
    expect(result.total.diff).toBeCloseTo(13); // 357.70 - 344.70
  });

  it('deve calcular impacto financeiro', () => {
    const result = compareTotals(
      mockBudgetNormalized.totals,
      mockOrderFormNormalized.totals
    );

    expect(result.financialImpact).toBeCloseTo(13);
  });

  it('deve retornar none quando totais são iguais', () => {
    const result = compareTotals(
      mockBudgetNormalized.totals,
      mockBudgetNormalized.totals
    );

    expect(result.impact).toBe('none');
    expect(result.financialImpact).toBe(0);
  });
});

describe('compareShipping', () => {
  it('deve identificar CEP igual', () => {
    const result = compareShipping(
      mockBudgetNormalized.shipping,
      mockOrderFormNormalized.shipping
    );

    expect(result?.postalCodeDiff).toBe(false);
  });

  it('deve identificar CEP diferente', () => {
    const result = compareShipping(
      mockBudgetNormalized.shipping,
      mockOrderFormDifferentCEP.shipping
    );

    expect(result?.postalCodeDiff).toBe(true);
    expect(result?.impact).toBe('high');
  });

  it('deve identificar diferença no valor do frete', () => {
    const result = compareShipping(
      mockBudgetNormalized.shipping,
      mockOrderFormNormalized.shipping
    );

    expect(result?.shippingValueDiff.diff).toBeCloseTo(3); // 18 - 15
  });

  it('deve retornar null quando ambos são null', () => {
    const result = compareShipping(null, null);
    expect(result).toBeNull();
  });
});

describe('comparePromotions', () => {
  it('deve identificar promoção igual', () => {
    const result = comparePromotions(
      mockBudgetNormalized.promotions,
      mockOrderFormNormalized.promotions
    );

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('match');
  });

  it('deve identificar promoção faltando no carrinho', () => {
    const result = comparePromotions(
      mockBudgetNormalized.promotions,
      [] // sem promoções
    );

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('only_in_budget');
    expect(result[0].impact).toBe('medium');
  });

  it('deve identificar promoção extra no carrinho', () => {
    const extraPromo = { id: 'extra', name: 'Promo Extra', value: 10 };
    
    const result = comparePromotions(
      [],
      [extraPromo]
    );

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('only_in_cart');
  });
});

describe('generateSummary', () => {
  it('deve gerar resumo corretamente', () => {
    const itemDiffs = compareItems(
      mockBudgetNormalized.items,
      mockOrderFormNormalized.items
    );
    const totalsDiff = compareTotals(
      mockBudgetNormalized.totals,
      mockOrderFormNormalized.totals
    );
    const shippingDiff = compareShipping(
      mockBudgetNormalized.shipping,
      mockOrderFormNormalized.shipping
    );
    const promoDiffs = comparePromotions(
      mockBudgetNormalized.promotions,
      mockOrderFormNormalized.promotions
    );

    const summary = generateSummary(itemDiffs, totalsDiff, shippingDiff, promoDiffs);

    expect(summary.totalDiffs).toBeGreaterThanOrEqual(0);
    expect(summary.financialImpact).toBeCloseTo(totalsDiff.financialImpact);
    expect(['none', 'low', 'medium', 'high', 'critical']).toContain(summary.overallImpact);
  });

  it('deve identificar zero divergências quando tudo é igual', () => {
    const itemDiffs = compareItems(
      [mockBudgetNormalized.items[0]],
      [mockBudgetNormalized.items[0]]
    );
    const totalsDiff = compareTotals(
      mockBudgetNormalized.totals,
      mockBudgetNormalized.totals
    );
    const shippingDiff = compareShipping(
      mockBudgetNormalized.shipping,
      mockBudgetNormalized.shipping
    );
    const promoDiffs = comparePromotions(
      mockBudgetNormalized.promotions,
      mockBudgetNormalized.promotions
    );

    const summary = generateSummary(itemDiffs, totalsDiff, shippingDiff, promoDiffs);

    expect(summary.totalDiffs).toBe(0);
    expect(summary.overallImpact).toBe('none');
  });
});
