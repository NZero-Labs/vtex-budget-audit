/**
 * Mocks de Budget para testes
 */

import { VTEXBudget, NormalizedItem, NormalizedTotals, NormalizedShipping, NormalizedPromotion } from '@/lib/compare/types';

export const mockBudgetRaw: VTEXBudget = {
  id: 'test-budget-001',
  idBudget: 12345,
  items: [
    {
      skuId: 'SKU001',
      productId: 'PROD001',
      name: 'Produto A',
      quantity: 2,
      price: 99.90,
      totalPrice: 199.80,
      sellerId: '1',
    },
    {
      skuId: 'SKU002',
      productId: 'PROD002',
      name: 'Produto B',
      quantity: 1,
      price: 149.90,
      totalPrice: 149.90,
      sellerId: '1',
    },
  ],
  totals: {
    subtotal: 349.70,
    discount: 20.00,
    shipping: 15.00,
    tax: 0,
    total: 344.70,
  },
  // Campos de entrega (formato Amara NZero)
  address: {
    postalCode: '01310-100',
  },
  deliveryType: 'PDO',
  shippingType: 'CIF',
  shipping: 15.00, // Valor do frete (número)
  promotions: [
    { id: 'promo1', name: 'Desconto 10%', value: 20.00 },
  ],
};

export const mockBudgetNormalized: {
  items: NormalizedItem[];
  totals: NormalizedTotals;
  shipping: NormalizedShipping;
  promotions: NormalizedPromotion[];
} = {
  items: [
    {
      skuId: 'SKU001',
      name: 'Produto A',
      quantity: 2,
      unitPrice: 99.90,
      totalPrice: 199.80,
      sellerId: '1',
    },
    {
      skuId: 'SKU002',
      name: 'Produto B',
      quantity: 1,
      unitPrice: 149.90,
      totalPrice: 149.90,
      sellerId: '1',
    },
  ],
  totals: {
    subtotal: 349.70,
    discounts: 20.00,
    shipping: 15.00,
    taxes: 0,
    total: 344.70,
  },
  shipping: {
    postalCode: '01310-100',
    deliveryType: 'Normal',
    shippingValue: 15.00,
  },
  promotions: [
    { id: 'promo1', name: 'Desconto 10%', value: 20.00 },
  ],
};
