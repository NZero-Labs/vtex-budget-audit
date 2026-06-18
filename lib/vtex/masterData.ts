import { VTEXBudget, BudgetVersion } from '@/lib/compare/types';
import { getVTEXConfig, getVTEXBaseUrl, getVTEXHeaders, isMockMode } from './config';
import { mockBudget } from './mocks';

/**
 * Busca um orçamento (Budget) pelo campo idBudget no Master Data
 * 
 * NOTA: O idBudget é um campo customizado da entidade, não o ID do documento.
 * Usa a API de search para buscar pelo campo.
 * 
 * Endpoint: GET /api/dataentities/{entity}/search?_where=idBudget={value}
 * 
 * @param idBudget Valor do campo idBudget do orçamento
 * @returns Dados do orçamento
 * @throws Error se não encontrar ou falhar
 */
export async function getBudget(idBudget: string | number): Promise<VTEXBudget> {
  // Modo mock para desenvolvimento/testes
  if (isMockMode()) {
    console.log('[MOCK] Retornando Budget mockado');
    return mockBudget;
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);
  const entity = config.masterDataEntity;

  const budgetId = String(idBudget);

  console.log(`[VTEX] Buscando Budget por idBudget=${budgetId} na entidade ${entity}`);

  /**
   * Busca pelo campo idBudget usando Search API
   * Endpoint: GET /api/dataentities/{entity}/search?_where=idBudget={value}
   */
  const searchUrl = `${baseUrl}/api/dataentities/${entity}/search?_where=idBudget=${budgetId}&_fields=_all`;

  const response = await fetch(searchUrl, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[VTEX] Erro ao buscar Budget: ${response.status}`, errorText);

    if (response.status === 401 || response.status === 403) {
      throw new Error('Credenciais VTEX inválidas ou sem permissão para acessar Master Data');
    }

    throw new Error(`Erro ao buscar orçamento: ${response.status} - ${errorText}`);
  }

  const results: VTEXBudget[] = await response.json();

  if (results.length === 0) {
    console.log(`[VTEX] Nenhum orçamento encontrado com idBudget=${budgetId}`);
    throw new Error(`Orçamento não encontrado: idBudget=${budgetId}`);
  }

  const budget = results[0];
  console.log(`[VTEX] Budget obtido: ${budget.items?.length || 0} itens`);

  return budget;
}

/**
 * Busca orçamento por um campo específico usando Search API
 * 
 * Endpoint: GET /api/dataentities/{entity}/search?_where={field}={value}
 * 
 * @param value Valor a buscar
 * @param field Nome do campo (default: idBudget)
 * @returns Primeiro orçamento encontrado ou null
 */
export async function searchBudgetByField(
  value: string | number,
  field: string = 'idBudget'
): Promise<VTEXBudget | null> {
  if (isMockMode()) {
    return mockBudget;
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);
  const entity = config.masterDataEntity;

  /**
   * Search endpoint com filtro _where
   * Documentação: https://developers.vtex.com/docs/api-reference/master-data-api-v2#get-/api/dataentities/-dataEntityName-/search
   */
  const searchUrl = `${baseUrl}/api/dataentities/${entity}/search?_where=${field}=${value}&_fields=_all`;

  console.log(`[VTEX] Buscando Budget por ${field}=${value}`);

  const response = await fetch(searchUrl, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(`[VTEX] Erro na busca: ${response.status}`);
    return null;
  }

  const results: VTEXBudget[] = await response.json();

  if (results.length === 0) {
    console.log(`[VTEX] Nenhum resultado encontrado para ${field}=${value}`);
    return null;
  }

  console.log(`[VTEX] Encontrado(s) ${results.length} resultado(s)`);
  return results[0];
}

/**
 * Lista orçamentos com paginação
 * Útil para debug e administração
 * 
 * @param page Número da página (1-indexed)
 * @param pageSize Tamanho da página
 * @returns Lista de orçamentos
 */
export async function listBudgets(
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: VTEXBudget[]; total: number }> {
  if (isMockMode()) {
    return { data: [mockBudget], total: 1 };
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);
  const entity = config.masterDataEntity;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  /**
   * Scroll/Search com paginação
   * Headers REST-Range para paginação: resources={from}-{to}
   */
  const url = `${baseUrl}/api/dataentities/${entity}/search?_fields=_all`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
      'REST-Range': `resources=${from}-${to}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao listar orçamentos: ${response.status}`);
  }

  const data: VTEXBudget[] = await response.json();

  // Total vem no header REST-Content-Range
  const contentRange = response.headers.get('REST-Content-Range');
  const totalMatch = contentRange?.match(/\/(\d+)/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : data.length;

  return { data, total };
}

/**
 * Lista todas as versões de um documento de orçamento no Master Data
 * 
 * Endpoint: GET /api/dataentities/{entity}/documents/{id}/versions
 * Documentação: https://developers.vtex.com/docs/api-reference/master-data-api-v2#get-/api/dataentities/-dataEntityName-/documents/-id-/versions
 * 
 * @param documentId ID do documento no Master Data (campo `id`, não `idBudget`)
 * @returns Lista de versões com metadados
 * @throws Error se falhar a requisição
 */
export async function getBudgetVersions(documentId: string): Promise<BudgetVersion[]> {
  if (isMockMode()) {
    return [
      { id: 'v1-mock', author: 'mock@vtex.com', date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'v2-mock', author: 'mock@vtex.com', date: new Date(Date.now() - 86400000).toISOString() },
    ];
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);
  const entity = config.masterDataEntity;

  const url = `${baseUrl}/api/dataentities/${entity}/documents/${documentId}/versions`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  const responseText = await response.text();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Documento não encontrado: ${documentId}`);
    }

    throw new Error(`Erro ao listar versões: ${response.status} - ${responseText}`);
  }

  if (!responseText) {
    return [];
  }

  let versions: BudgetVersion[];
  try {
    versions = JSON.parse(responseText);
  } catch {
    throw new Error(`Resposta inválida da API de versões: não é JSON válido`);
  }

  return versions;
}

/**
 * Obtém uma versão específica de um documento de orçamento
 * 
 * Endpoint: GET /api/dataentities/{entity}/documents/{id}/versions/{versionId}
 * Documentação: https://developers.vtex.com/docs/api-reference/master-data-api-v2#get-/api/dataentities/-dataEntityName-/documents/-id-/versions/-versionId-
 * 
 * @param documentId ID do documento no Master Data (campo `id`)
 * @param versionId ID da versão a ser obtida
 * @returns Dados do orçamento naquela versão
 * @throws Error se não encontrar ou falhar
 */
export async function getBudgetVersion(documentId: string, versionId: string): Promise<VTEXBudget> {
  if (isMockMode()) {
    return { ...mockBudget, id: documentId };
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);
  const entity = config.masterDataEntity;

  const url = `${baseUrl}/api/dataentities/${entity}/documents/${documentId}/versions/${versionId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  const responseText = await response.text();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Versão ${versionId} não encontrada para documento ${documentId}`);
    }

    throw new Error(`Erro ao buscar versão: ${response.status} - ${responseText}`);
  }

  if (!responseText) {
    throw new Error(`Resposta vazia da API de versões para documento ${documentId}, versão ${versionId}`);
  }

  let rawData: unknown;
  try {
    rawData = JSON.parse(responseText);
  } catch {
    throw new Error(`Resposta inválida da API de versões: não é JSON válido`);
  }

  // A API de versões retorna um wrapper: { id, author, document: {...} }
  // O budget real está dentro do campo "document"
  const versionWrapper = rawData as { id: string; author: string; document: VTEXBudget };
  const budget: VTEXBudget = versionWrapper.document ?? (rawData as VTEXBudget);

  return budget;
}
