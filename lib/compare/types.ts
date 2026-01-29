/**
 * Tipagens para o sistema de comparação Budget vs OrderForm
 * 
 * Este módulo define todas as interfaces e tipos utilizados no
 * processo de normalização e comparação de dados VTEX.
 */

// =============================================================================
// Tipos de Criticidade e Status
// =============================================================================

/**
 * Níveis de impacto/criticidade para divergências
 * - none: Sem divergência
 * - low: Divergência menor, sem impacto financeiro significativo
 * - medium: Divergência moderada, requer atenção
 * - high: Divergência alta, impacto financeiro considerável
 * - critical: Divergência crítica, pode impedir fechamento do pedido
 */
export type ImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Status de comparação de item
 */
export type ItemDiffStatus =
  | 'match'              // Item idêntico em ambos
  | 'quantity_diff'      // Quantidade diferente
  | 'price_diff'         // Preço diferente
  | 'quantity_price_diff'// Quantidade e preço diferentes
  | 'missing_in_cart'    // Item no orçamento mas não no carrinho
  | 'unexpected_in_cart'; // Item no carrinho mas não no orçamento

// =============================================================================
// Estruturas Normalizadas (para comparação uniforme)
// =============================================================================

/**
 * Item normalizado - estrutura comum para itens de Budget e OrderForm
 */
export interface NormalizedItem {
  /** ID do SKU */
  skuId: string;
  /** Nome do produto */
  name: string;
  /** Quantidade */
  quantity: number;
  /** Preço unitário em reais (decimal) */
  unitPrice: number;
  /** Preço total em reais (decimal) */
  totalPrice: number;
  /** ID do seller (opcional) */
  sellerId?: string;
  /** Ref ID do produto */
  refId?: string;
  /** URL da imagem */
  imageUrl?: string;
}

/**
 * Totais financeiros normalizados
 */
export interface NormalizedTotals {
  /** Subtotal (soma dos itens) */
  subtotal: number;
  /** Total de descontos aplicados */
  discounts: number;
  /** Valor do frete */
  shipping: number;
  /** Impostos */
  taxes: number;
  /** Total final */
  total: number;
}

/**
 * Dados de entrega normalizados
 */
export interface NormalizedShipping {
  /** CEP de entrega */
  postalCode: string;
  /** Tipo de entrega (ex: normal, expressa) */
  deliveryType: string;
  /** Valor do frete em reais */
  shippingValue: number;
  /** Ponto de retirada (se pickup) */
  pickupPoint?: string;
  /** Endereço completo */
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

/**
 * Promoção/benefício normalizado
 */
export interface NormalizedPromotion {
  /** ID da promoção */
  id: string;
  /** Nome da promoção */
  name: string;
  /** Valor do desconto em reais */
  value: number;
  /** Tipo (ex: percentage, nominal) */
  type?: string;
}

/**
 * Estrutura completa normalizada (Budget ou OrderForm)
 */
export interface NormalizedData {
  items: NormalizedItem[];
  totals: NormalizedTotals;
  shipping: NormalizedShipping | null;
  promotions: NormalizedPromotion[];
  /** Informações adicionais de contexto */
  context?: {
    cluster?: string;
    sellerId?: string;
    hasItemWithoutStock?: boolean;
    hasPreSaleItem?: boolean;
    /**
     * Tags de marketing aplicadas
     * Usado para verificar promoções como Bonifiq ("usar-pontos-agora")
     */
    marketingTags?: string[];
  };
}

// =============================================================================
// Estruturas de Diferença (Diff)
// =============================================================================

/**
 * Diferença de item individual
 */
export interface ItemDiff {
  /** ID do SKU */
  skuId: string;
  /** Nome do produto */
  name: string;
  /** Status da comparação */
  status: ItemDiffStatus;
  /** Quantidade no orçamento */
  budgetQty?: number;
  /** Quantidade no carrinho */
  cartQty?: number;
  /** Preço unitário no orçamento */
  budgetPrice?: number;
  /** Preço unitário no carrinho */
  cartPrice?: number;
  /** Diferença absoluta de preço */
  priceDiffAbs?: number;
  /** Diferença percentual de preço */
  priceDiffPct?: number;
  /** Diferença absoluta de quantidade */
  qtyDiffAbs?: number;
  /** Nível de impacto */
  impact: ImpactLevel;
  /** Mensagem explicativa */
  explanation?: string;
}

/**
 * Diferença de totais financeiros
 */
export interface TotalsDiff {
  /** Comparação de subtotal */
  subtotal: {
    budget: number;
    cart: number;
    diff: number;
    diffPct: number;
  };
  /** Comparação de descontos */
  discounts: {
    budget: number;
    cart: number;
    diff: number;
    diffPct: number;
  };
  /** Comparação de frete */
  shipping: {
    budget: number;
    cart: number;
    diff: number;
    diffPct: number;
  };
  /** Comparação de impostos */
  taxes: {
    budget: number;
    cart: number;
    diff: number;
    diffPct: number;
  };
  /** Comparação de total */
  total: {
    budget: number;
    cart: number;
    diff: number;
    diffPct: number;
  };
  /** Impacto financeiro total */
  financialImpact: number;
  /** Criticidade geral dos totais */
  impact: ImpactLevel;
  /** Explicação do impacto */
  explanation?: string;
}

/**
 * Diferença de dados de entrega
 */
export interface ShippingDiff {
  /** CEP divergente */
  postalCodeDiff: boolean;
  budgetPostalCode?: string;
  cartPostalCode?: string;
  /** Tipo de entrega divergente */
  deliveryTypeDiff: boolean;
  budgetDeliveryType?: string;
  cartDeliveryType?: string;
  /** Valor do frete divergente */
  shippingValueDiff: {
    budget: number;
    cart: number;
    diff: number;
    diffPct: number;
  };
  /** Criticidade */
  impact: ImpactLevel;
  /** Explicação */
  explanation?: string;
}

/**
 * Diferença de promoção
 */
export interface PromoDiff {
  /** ID da promoção */
  id: string;
  /** Nome da promoção */
  name: string;
  /** Status */
  status: 'match' | 'only_in_budget' | 'only_in_cart' | 'value_diff';
  /** Valor no orçamento */
  budgetValue?: number;
  /** Valor no carrinho */
  cartValue?: number;
  /** Diferença de valor */
  valueDiff?: number;
  /** Criticidade */
  impact: ImpactLevel;
  /** Explicação */
  explanation?: string;
}

/**
 * Diferença de marketing tag
 * Usado para verificar tags como "usar-pontos-agora" (Bonifiq)
 */
export interface MarketingTagDiff {
  /** Nome da tag */
  tag: string;
  /** Tag presente no orçamento */
  inBudget: boolean;
  /** Tag presente no carrinho */
  inCart: boolean;
  /** Tags estão alinhadas */
  match: boolean;
  /** Criticidade */
  impact: ImpactLevel;
  /** Explicação */
  explanation?: string;
}

// =============================================================================
// Resultado da Comparação
// =============================================================================

/**
 * Resumo da comparação
 */
export interface ComparisonSummary {
  /** Total de divergências encontradas */
  totalDiffs: number;
  /** Divergências críticas */
  criticalDiffs: number;
  /** Divergências de alta prioridade */
  highDiffs: number;
  /** Divergências médias */
  mediumDiffs: number;
  /** Impacto financeiro total em reais */
  financialImpact: number;
  /** Criticidade geral */
  overallImpact: ImpactLevel;
}

/**
 * Metadados da comparação
 */
export interface ComparisonMetadata {
  /** ID do OrderForm */
  orderFormId: string;
  /** ID do orçamento */
  budgetId: string;
  /** Data/hora da comparação */
  comparedAt: string;
  /** ID único da requisição (para auditoria) */
  requestId: string;
}

/**
 * Resultado completo da comparação
 */
export interface ComparisonResult {
  /** Resumo geral */
  summary: ComparisonSummary;
  /** Diferenças de itens */
  itemDiffs: ItemDiff[];
  /** Diferenças de totais */
  totalsDiff: TotalsDiff;
  /** Diferenças de entrega */
  shippingDiff: ShippingDiff | null;
  /** Diferenças de promoções */
  promoDiffs: PromoDiff[];
  /** Diferenças de marketing tags (ex: Bonifiq) */
  marketingTagDiffs: MarketingTagDiff[];
  /** Metadados */
  metadata: ComparisonMetadata;
}

// =============================================================================
// Tipos da API VTEX - OrderForm (parcial)
// =============================================================================

/**
 * Estrutura parcial do OrderForm da VTEX
 * Documentação: https://developers.vtex.com/docs/guides/orderform-fields
 */
export interface VTEXOrderForm {
  orderFormId: string;
  items: VTEXOrderFormItem[];
  totalizers: VTEXTotalizer[];
  shippingData?: {
    address?: VTEXAddress;
    logisticsInfo?: VTEXLogisticsInfo[];
    selectedAddresses?: VTEXAddress[];
  };
  ratesAndBenefitsData?: {
    rateAndBenefitsIdentifiers?: VTEXRateAndBenefit[];
    teaser?: unknown[];
  };
  /**
   * Dados de marketing do carrinho
   * Contém tags de marketing aplicadas (ex: Bonifiq)
   */
  marketingData?: {
    marketingTags?: string[];
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    coupon?: string;
  };
  clientProfileData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    document?: string;
  };
  value: number; // em centavos
  messages?: VTEXMessage[];
}

export interface VTEXOrderFormItem {
  id: string;
  productId: string;
  name: string;
  skuName?: string;
  quantity: number;
  price: number; // em centavos
  listPrice: number; // em centavos
  sellingPrice: number; // em centavos
  seller: string;
  imageUrl?: string;
  refId?: string;
  availability?: string;
  priceDefinition?: {
    total: number;
    sellingPrices: Array<{ value: number; quantity: number }>;
  };
}

export interface VTEXTotalizer {
  id: string;
  name: string;
  value: number; // em centavos
}

export interface VTEXAddress {
  postalCode: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  complement?: string;
}

export interface VTEXLogisticsInfo {
  itemIndex: number;
  selectedSla?: string;
  selectedDeliveryChannel?: string;
  price?: number;
  shipsTo?: string[];
  slas?: VTEXSla[];
}

export interface VTEXSla {
  id: string;
  name: string;
  price: number;
  deliveryChannel: string;
  pickupStoreInfo?: {
    friendlyName?: string;
    address?: VTEXAddress;
  };
}

export interface VTEXRateAndBenefit {
  id: string;
  name: string;
  featured?: boolean;
  description?: string;
  /**
   * Parâmetros que ativaram a promoção
   * marketingTags pode conter tags como "usar-pontos-agora" (Bonifiq)
   */
  matchedParameters?: {
    marketingTags?: string;
    [key: string]: string | undefined;
  };
  additionalInfo?: {
    brandName?: string;
    brandId?: string;
  };
}

export interface VTEXMessage {
  code: string;
  text: string;
  status: string;
}

// =============================================================================
// Tipos da API VTEX - Master Data Budget (customizado)
// =============================================================================

/**
 * Estrutura do Budget no Master Data
 * NOTA: Esta estrutura deve ser adaptada conforme a entidade configurada
 * na sua conta VTEX.
 */
export interface VTEXBudget {
  /** ID do documento no Master Data */
  id: string;
  /** ID customizado do orçamento */
  idBudget?: string | number;
  /** Itens do orçamento */
  items: VTEXBudgetItem[];
  /** Totais */
  totals?: {
    subtotal?: number;
    discount?: number;
    shipping?: number;
    tax?: number;
    total: number;
  };
  /**
   * Endereço de entrega do orçamento
   * Contém o CEP (postalCode)
   */
  address?: VTEXAddress;
  /**
   * Valor total de descontos do orçamento
   */
  discounts?: number;
  /** 
   * Valor do frete base (CIF/PDO)
   * Campo direto no orçamento
   */
  shipping?: number;
  /**
   * Valor da diferença entre frete CIF/EXP e CIF/PDO
   * Usado para calcular frete expresso
   */
  shippingDeliveryValue?: number;
  /**
   * Tipo de entrega do orçamento
   * PDO = Padrão / EXP = Expresso
   */
  deliveryType?: string;
  /**
   * Tipo de frete do orçamento
   * CIF = Frete incluso / FOB = Frete por conta do cliente
   */
  shippingType?: string;
  /**
   * Dados customizados do orçamento
   * Contém informações adicionais
   */
  customData?: Record<string, unknown>;
  /** Dados de entrega legados (deprecated, usar campos individuais) */
  shippingData?: {
    postalCode?: string;
    deliveryType?: string;
    shippingValue?: number;
    address?: VTEXAddress;
  };
  /** Promoções previstas */
  promotions?: Array<{
    id: string;
    name: string;
    value: number;
  }>;
  /** Contexto adicional */
  context?: {
    cluster?: string;
    sellerId?: string;
  };
  /**
   * Tags de marketing aplicadas ao orçamento
   * Ex: "usar-pontos-agora" (Bonifiq)
   */
  marketingTags?: string[];
  /** Data de criação */
  createdAt?: string;
  /** Data de atualização */
  updatedAt?: string;
}

/**
 * Price tag para descontos e ajustes de preço
 */
export interface VTEXPriceTag {
  /** Identificador do price tag */
  identifier?: string;
  /** Nome do price tag */
  name: string;
  /** Valor do desconto/ajuste (geralmente negativo para descontos) */
  value: number;
  /** Se é percentual */
  isPercentual?: boolean;
  /** Valor bruto */
  rawValue?: number;
}

export interface VTEXBudgetItem {
  skuId: string;
  productId?: string;
  name: string;
  quantity: number;
  /** Preço de lista (preço original sem descontos) */
  price: number;
  /** Preço de venda (preço final com descontos aplicados) - usado para comparação */
  sellingPrice?: number;
  /** Preço total */
  totalPrice?: number;
  sellerId?: string;
  refId?: string;
  imageUrl?: string;
  /**
   * Price tags contendo descontos e ajustes de preço
   * Valores negativos indicam descontos
   */
  priceTags?: VTEXPriceTag[];
}

// =============================================================================
// Tipos de Request/Response da API
// =============================================================================

/**
 * Payload de entrada para comparação
 */
export interface CompareRequest {
  /** URL do carrinho VTEX (contendo orderFormId) */
  orderFormUrl: string;
  /** ID do orçamento no Master Data */
  idBudget: string | number;
}

/**
 * Resposta de erro da API
 */
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
  requestId?: string;
}
