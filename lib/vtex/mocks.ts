/**
 * Dados mockados para desenvolvimento e testes
 * 
 * Use a variável de ambiente USE_MOCK_DATA=true para ativar
 * 
 * Estes mocks simulam respostas reais das APIs VTEX para permitir
 * desenvolvimento sem conexão com a plataforma.
 */

import { VTEXOrderForm, VTEXBudget } from '@/lib/compare/types';

/**
 * Mock de OrderForm da VTEX
 * Baseado na estrutura documentada em:
 * https://developers.vtex.com/docs/guides/orderform-fields
 */
export const mockOrderForm: VTEXOrderForm = {
  orderFormId: 'mock-orderform-123456789',
  items: [
    {
      id: 'SKU001',
      productId: 'PROD001',
      name: 'Produto Exemplo A',
      skuName: 'Variação Azul',
      quantity: 2,
      price: 9990, // R$ 99,90 em centavos
      listPrice: 12990,
      sellingPrice: 9990,
      seller: '1',
      imageUrl: 'https://example.com/img/sku001.jpg',
      refId: 'REF-A-001',
      availability: 'available',
    },
    {
      id: 'SKU002',
      productId: 'PROD002',
      name: 'Produto Exemplo B',
      skuName: 'Tamanho M',
      quantity: 1,
      price: 15990, // R$ 159,90 em centavos
      listPrice: 15990,
      sellingPrice: 15990,
      seller: '1',
      imageUrl: 'https://example.com/img/sku002.jpg',
      refId: 'REF-B-002',
      availability: 'available',
    },
    {
      id: 'SKU003',
      productId: 'PROD003',
      name: 'Produto Exemplo C - Apenas no Carrinho',
      quantity: 1,
      price: 4990, // R$ 49,90 em centavos
      listPrice: 4990,
      sellingPrice: 4990,
      seller: '1',
      availability: 'available',
    },
  ],
  totalizers: [
    { id: 'Items', name: 'Total dos Itens', value: 30960 }, // R$ 309,60
    { id: 'Discounts', name: 'Descontos', value: -2000 }, // -R$ 20,00
    { id: 'Shipping', name: 'Frete', value: 1500 }, // R$ 15,00
    { id: 'Tax', name: 'Impostos', value: 0 },
  ],
  shippingData: {
    address: {
      postalCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'BRA',
    },
    logisticsInfo: [
      {
        itemIndex: 0,
        selectedSla: 'AMARANZ LOGISTICA FSA', // Mapeia para PDO/CIF no orçamento
        selectedDeliveryChannel: 'delivery',
        price: 500,
      },
      {
        itemIndex: 1,
        selectedSla: 'AMARANZ LOGISTICA FSA',
        selectedDeliveryChannel: 'delivery',
        price: 500,
      },
      {
        itemIndex: 2,
        selectedSla: 'AMARANZ LOGISTICA FSA',
        selectedDeliveryChannel: 'delivery',
        price: 500,
      },
    ],
  },
  ratesAndBenefitsData: {
    rateAndBenefitsIdentifiers: [
      {
        id: 'promo-001',
        name: 'Desconto de Boas-vindas',
        description: '10% off na primeira compra',
      },
      {
        id: 'promo-cupom-20',
        name: 'Cupom DESCONTO20',
        description: 'Desconto de R$ 20,00',
      },
      {
        id: 'promo-bonifiq',
        name: 'Bonifiq - Usar Pontos',
        description: 'Desconto usando pontos Bonifiq',
        matchedParameters: {
          marketingTags: 'usar-pontos-agora',
        },
      },
    ],
  },
  /**
   * Dados de marketing do carrinho
   * Tags aplicadas para ativar promoções
   */
  marketingData: {
    marketingTags: ['usar-pontos-agora'],
    utmCampaign: 'bonifiq-campanha',
    utmSource: 'email',
  },
  value: 30460, // R$ 304,60 em centavos (total final)
  messages: [],
};

/**
 * Mock de Budget do Master Data
 * Estrutura customizada conforme Amara NZero
 * 
 * Campos de entrega:
 * - address.postalCode: CEP do cliente
 * - deliveryType: PDO (padrão) ou EXP (expresso)
 * - shippingType: CIF (frete incluso) ou FOB (frete por conta do cliente)
 * - shipping: valor do frete base (CIF/PDO)
 * - shippingDeliveryValue: diferença entre CIF/EXP e CIF/PDO
 * 
 * Campos de desconto:
 * - priceTags nos itens: valores negativos representam descontos
 * - discounts: valor total de descontos (fallback)
 */
export const mockBudget: VTEXBudget = {
  id: 'budget-doc-abc123',
  idBudget: 12345,
  items: [
    {
      skuId: 'SKU001',
      productId: 'PROD001',
      name: 'Produto Exemplo A',
      quantity: 2,
      price: 99.90, // Preço de lista
      sellingPrice: 94.90, // Preço de venda (com desconto)
      totalPrice: 189.80,
      sellerId: '1',
      refId: 'REF-A-001',
      priceTags: [
        {
          name: 'Desconto de Boas-vindas',
          identifier: 'promo-001',
          value: -5.00,
          isPercentual: false,
        },
      ],
    },
    {
      skuId: 'SKU002',
      productId: 'PROD002',
      name: 'Produto Exemplo B',
      quantity: 1,
      price: 159.90, // Preço de lista
      sellingPrice: 149.90, // Preço de venda (diferente do carrinho R$ 159,90)
      totalPrice: 149.90,
      sellerId: '1',
      refId: 'REF-B-002',
      priceTags: [
        {
          name: 'Desconto de Boas-vindas',
          identifier: 'promo-001',
          value: -10.00,
          isPercentual: false,
        },
      ],
    },
    {
      skuId: 'SKU004',
      productId: 'PROD004',
      name: 'Produto Exemplo D - Apenas no Orçamento',
      quantity: 1,
      price: 79.90,
      sellingPrice: 79.90, // Sem desconto
      totalPrice: 79.90,
      sellerId: '1',
      // Sem desconto neste item
      priceTags: [],
    },
  ],
  totals: {
    subtotal: 429.60,
    discount: 10.00,
    shipping: 12.00,
    tax: 0,
    total: 431.60,
  },
  // Endereço de entrega (contém o CEP)
  address: {
    postalCode: '01310-100',
    street: 'Avenida Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
  // Valor total de descontos
  discounts: 10.00,
  // Campos de entrega
  deliveryType: 'PDO', // PDO = Padrão, EXP = Expresso
  shippingType: 'CIF', // CIF = Frete incluso, FOB = Por conta do cliente
  shipping: 12.00, // Valor base do frete (CIF/PDO)
  shippingDeliveryValue: 8.00, // Diferença para EXP (não aplicada neste caso pois deliveryType = PDO)
  // Dados customizados (outros campos)
  customData: {
    clientName: 'Cliente Exemplo',
  },
  promotions: [
    {
      id: 'promo-001',
      name: 'Desconto de Boas-vindas',
      value: 10.00,
    },
  ],
  context: {
    cluster: 'premium',
    sellerId: '1',
  },
  /**
   * Tags de marketing aplicadas ao orçamento
   * Ex: "usar-pontos-agora" para promoção Bonifiq
   */
  marketingTags: ['usar-pontos-agora'],
  createdAt: '2026-01-20T10:00:00Z',
  updatedAt: '2026-01-20T10:00:00Z',
};

/**
 * Gera um mock de OrderForm com dados customizados
 * Útil para testes com cenários específicos
 */
export function createMockOrderForm(
  overrides: Partial<VTEXOrderForm>
): VTEXOrderForm {
  return {
    ...mockOrderForm,
    ...overrides,
    items: overrides.items || mockOrderForm.items,
    totalizers: overrides.totalizers || mockOrderForm.totalizers,
  };
}

/**
 * Gera um mock de Budget com dados customizados
 */
export function createMockBudget(
  overrides: Partial<VTEXBudget>
): VTEXBudget {
  return {
    ...mockBudget,
    ...overrides,
    items: overrides.items || mockBudget.items,
  };
}
