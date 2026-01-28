/**
 * Mocks de OrderForm para testes
 */

import { VTEXOrderForm, NormalizedItem, NormalizedTotals, NormalizedShipping, NormalizedPromotion } from '@/lib/compare/types';

export const mockOrderFormRaw: VTEXOrderForm = {
  orderFormId: 'test-orderform-001',
  items: [
    {
      id: 'SKU001',
      productId: 'PROD001',
      name: 'Produto A',
      quantity: 2,
      price: 9990, // centavos
      listPrice: 11990,
      sellingPrice: 9990,
      seller: '1',
    },
    {
      id: 'SKU002',
      productId: 'PROD002',
      name: 'Produto B',
      quantity: 1,
      price: 15990, // centavos - preço diferente do orçamento
      listPrice: 15990,
      sellingPrice: 15990,
      seller: '1',
    },
  ],
  totalizers: [
    { id: 'Items', name: 'Itens', value: 35970 },
    { id: 'Discounts', name: 'Descontos', value: -2000 },
    { id: 'Shipping', name: 'Frete', value: 1800 }, // frete diferente
    { id: 'Tax', name: 'Impostos', value: 0 },
  ],
  shippingData: {
    address: {
      postalCode: '01310-100',
      street: 'Av Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    logisticsInfo: [
      { itemIndex: 0, selectedSla: 'Normal', price: 900 },
      { itemIndex: 1, selectedSla: 'Normal', price: 900 },
    ],
  },
  ratesAndBenefitsData: {
    rateAndBenefitsIdentifiers: [
      { id: 'promo1', name: 'Desconto 10%' },
    ],
  },
  value: 35770, // centavos
};

export const mockOrderFormNormalized: {
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
      unitPrice: 159.90, // diferente do orçamento
      totalPrice: 159.90,
      sellerId: '1',
    },
  ],
  totals: {
    subtotal: 359.70,
    discounts: 20.00,
    shipping: 18.00, // diferente do orçamento
    taxes: 0,
    total: 357.70,
  },
  shipping: {
    postalCode: '01310-100',
    deliveryType: 'Normal',
    shippingValue: 18.00,
  },
  promotions: [
    { id: 'promo1', name: 'Desconto 10%', value: 0 },
  ],
};

// Mock com item faltando no carrinho
export const mockOrderFormMissingItem: typeof mockOrderFormNormalized = {
  ...mockOrderFormNormalized,
  items: [mockOrderFormNormalized.items[0]], // Apenas SKU001
};

// Mock com item extra no carrinho
export const mockOrderFormExtraItem: typeof mockOrderFormNormalized = {
  ...mockOrderFormNormalized,
  items: [
    ...mockOrderFormNormalized.items,
    {
      skuId: 'SKU003',
      name: 'Produto Extra',
      quantity: 1,
      unitPrice: 50.00,
      totalPrice: 50.00,
    },
  ],
};

// Mock com CEP diferente
export const mockOrderFormDifferentCEP: typeof mockOrderFormNormalized = {
  ...mockOrderFormNormalized,
  shipping: {
    ...mockOrderFormNormalized.shipping,
    postalCode: '04567-890', // CEP diferente
  },
};
