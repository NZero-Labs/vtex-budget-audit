/**
 * Cliente para a API de Catálogo da VTEX
 * 
 * Documentação oficial:
 * - Catalog API: https://developers.vtex.com/docs/api-reference/catalog-api
 * - Get SKU: https://developers.vtex.com/docs/api-reference/catalog-api#get-/api/catalog/pvt/stockkeepingunit/-skuId-
 */

import { getVTEXConfig, getVTEXBaseUrl, getVTEXHeaders, isMockMode } from './config';

/**
 * Detalhes do SKU retornados pela API de Catálogo
 */
export interface VTEXSkuDetails {
  Id: number;
  ProductId: number;
  IsActive: boolean;
  ActivateIfPossible: boolean;
  Name: string;
  NameComplete: string;
  ProductName: string;
  ProductDescription: string;
  SkuName: string;
  /** Unidade de medida (ex: "un", "kg") */
  MeasurementUnit: string;
  /** Multiplicador de unidade */
  UnitMultiplier: number;
  /** Peso em kg */
  WeightKg: number | null;
  /** Altura em cm */
  Height: number | null;
  /** Largura em cm */
  Width: number | null;
  /** Comprimento em cm */
  Length: number | null;
  /** Peso cubado */
  CubicWeight: number;
  /** Se é kit */
  IsKit: boolean;
  /** URL da imagem */
  ImageUrl: string | null;
  /** Referência do SKU */
  RefId: string | null;
  /** Código EAN */
  EAN: string | null;
  /** Data de criação */
  CreationDate: string;
  /** Estimativa de chegada */
  EstimatedDateArrival: string | null;
}

/**
 * Mock de detalhes do SKU para desenvolvimento
 */
const mockSkuDetails: Record<string, VTEXSkuDetails> = {
  'SKU001': {
    Id: 1,
    ProductId: 1,
    IsActive: true,
    ActivateIfPossible: true,
    Name: 'Produto Exemplo A - Variação Azul',
    NameComplete: 'Produto Exemplo A - Variação Azul',
    ProductName: 'Produto Exemplo A',
    ProductDescription: 'Descrição do produto A',
    SkuName: 'Variação Azul',
    MeasurementUnit: 'un',
    UnitMultiplier: 1,
    WeightKg: 2.5,
    Height: 30,
    Width: 20,
    Length: 15,
    CubicWeight: 1.5,
    IsKit: false,
    ImageUrl: 'https://example.com/img/sku001.jpg',
    RefId: 'REF-A-001',
    EAN: '7891234567890',
    CreationDate: '2024-01-01T00:00:00Z',
    EstimatedDateArrival: null,
  },
  'SKU002': {
    Id: 2,
    ProductId: 2,
    IsActive: true,
    ActivateIfPossible: true,
    Name: 'Produto Exemplo B - Tamanho M',
    NameComplete: 'Produto Exemplo B - Tamanho M',
    ProductName: 'Produto Exemplo B',
    ProductDescription: 'Descrição do produto B',
    SkuName: 'Tamanho M',
    MeasurementUnit: 'un',
    UnitMultiplier: 1,
    WeightKg: 1.2,
    Height: 40,
    Width: 30,
    Length: 5,
    CubicWeight: 1.0,
    IsKit: false,
    ImageUrl: 'https://example.com/img/sku002.jpg',
    RefId: 'REF-B-002',
    EAN: '7891234567891',
    CreationDate: '2024-01-01T00:00:00Z',
    EstimatedDateArrival: null,
  },
  'SKU003': {
    Id: 3,
    ProductId: 3,
    IsActive: true,
    ActivateIfPossible: true,
    Name: 'Produto Exemplo C',
    NameComplete: 'Produto Exemplo C',
    ProductName: 'Produto Exemplo C',
    ProductDescription: 'Descrição do produto C',
    SkuName: 'Padrão',
    MeasurementUnit: 'un',
    UnitMultiplier: 1,
    WeightKg: 0.8,
    Height: 10,
    Width: 10,
    Length: 10,
    CubicWeight: 0.17,
    IsKit: false,
    ImageUrl: null,
    RefId: null,
    EAN: null,
    CreationDate: '2024-01-01T00:00:00Z',
    EstimatedDateArrival: null,
  },
  'SKU004': {
    Id: 4,
    ProductId: 4,
    IsActive: true,
    ActivateIfPossible: true,
    Name: 'Produto Exemplo D',
    NameComplete: 'Produto Exemplo D',
    ProductName: 'Produto Exemplo D',
    ProductDescription: 'Descrição do produto D',
    SkuName: 'Padrão',
    MeasurementUnit: 'un',
    UnitMultiplier: 1,
    WeightKg: 3.5,
    Height: 50,
    Width: 40,
    Length: 30,
    CubicWeight: 10.0,
    IsKit: false,
    ImageUrl: null,
    RefId: null,
    EAN: null,
    CreationDate: '2024-01-01T00:00:00Z',
    EstimatedDateArrival: null,
  },
};

/**
 * Busca detalhes de um SKU pela API de Catálogo
 * 
 * Endpoint: GET /api/catalog/pvt/stockkeepingunit/{skuId}
 * 
 * @param skuId ID do SKU
 * @returns Detalhes do SKU incluindo peso e dimensões
 * @throws Error se a requisição falhar
 */
export async function getSkuDetails(skuId: string): Promise<VTEXSkuDetails | null> {
  // Modo mock para desenvolvimento/testes
  if (isMockMode()) {
    console.log(`[MOCK] Retornando detalhes do SKU ${skuId}`);
    return mockSkuDetails[skuId] || null;
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);

  /**
   * Endpoint privado do Catalog API
   * Documentação: https://developers.vtex.com/docs/api-reference/catalog-api#get-/api/catalog/pvt/stockkeepingunit/-skuId-
   */
  const url = `${baseUrl}/api/catalog/pvt/stockkeepingunit/${skuId}`;

  console.log(`[VTEX Catalog] Buscando SKU: ${skuId}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      // Cache de 5 minutos para dados de catálogo (mudam pouco)
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[VTEX Catalog] SKU não encontrado: ${skuId}`);
        return null;
      }

      const errorText = await response.text();
      console.error(`[VTEX Catalog] Erro ao buscar SKU: ${response.status}`, errorText);
      throw new Error(`Erro ao buscar SKU ${skuId}: ${response.status}`);
    }

    const skuDetails: VTEXSkuDetails = await response.json();
    console.log(`[VTEX Catalog] SKU ${skuId} obtido: ${skuDetails.Name}, Peso: ${skuDetails.WeightKg}kg`);

    return skuDetails;
  } catch (error) {
    console.error(`[VTEX Catalog] Erro ao buscar SKU ${skuId}:`, error);
    throw error;
  }
}

/**
 * Busca detalhes de múltiplos SKUs em paralelo
 * 
 * @param skuIds Array de IDs de SKU
 * @returns Map de SKU ID -> Detalhes do SKU
 */
export async function getMultipleSkuDetails(
  skuIds: string[]
): Promise<Map<string, VTEXSkuDetails>> {
  // Remover duplicados
  const uniqueSkuIds = [...new Set(skuIds)];
  
  console.log(`[VTEX Catalog] Buscando ${uniqueSkuIds.length} SKUs em paralelo`);

  // Buscar todos em paralelo
  const results = await Promise.allSettled(
    uniqueSkuIds.map(skuId => getSkuDetails(skuId))
  );

  // Montar mapa de resultados
  const skuMap = new Map<string, VTEXSkuDetails>();

  results.forEach((result, index) => {
    const skuId = uniqueSkuIds[index];
    if (result.status === 'fulfilled' && result.value) {
      skuMap.set(skuId, result.value);
    } else {
      console.warn(`[VTEX Catalog] Falha ao buscar SKU ${skuId}`);
    }
  });

  console.log(`[VTEX Catalog] ${skuMap.size}/${uniqueSkuIds.length} SKUs obtidos com sucesso`);

  return skuMap;
}

/**
 * Extrai o peso de um SKU em kg
 * Retorna 0 se o peso não estiver disponível
 * 
 * @param skuDetails Detalhes do SKU
 * @returns Peso em kg
 */
export function getSkuWeight(skuDetails: VTEXSkuDetails | null | undefined): number {
  if (!skuDetails || skuDetails.WeightKg === null || skuDetails.WeightKg === undefined) {
    return 0;
  }
  return skuDetails.WeightKg;
}

/**
 * Cria um mapa de SKU ID -> Peso em kg
 * 
 * @param skuDetailsMap Map de SKU ID -> Detalhes do SKU
 * @returns Map de SKU ID -> Peso em kg
 */
export function createWeightMap(
  skuDetailsMap: Map<string, VTEXSkuDetails>
): Map<string, number> {
  const weightMap = new Map<string, number>();

  for (const [skuId, details] of skuDetailsMap) {
    weightMap.set(skuId, getSkuWeight(details));
  }

  return weightMap;
}
