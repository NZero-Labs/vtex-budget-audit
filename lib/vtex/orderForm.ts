/**
 * Cliente para a API de Checkout da VTEX (OrderForm)
 * 
 * Documentação oficial:
 * - Checkout API: https://developers.vtex.com/docs/api-reference/checkout-api
 * - OrderForm Fields: https://developers.vtex.com/docs/guides/orderform-fields
 * - Get cart by ID: https://developers.vtex.com/docs/guides/get-cart-information-by-id
 * 
 * Inspiração em patterns:
 * - io-clients: https://github.com/vtex/io-clients
 * - order-manager: https://github.com/vtex-apps/order-manager
 */

import { VTEXOrderForm } from '@/lib/compare/types';
import { getVTEXConfig, getVTEXBaseUrl, getVTEXHeaders, isMockMode } from './config';
import { mockOrderForm } from './mocks';

/**
 * Extrai o orderFormId de uma URL de carrinho VTEX
 * 
 * Formatos suportados:
 * - https://www.loja.com.br/checkout#/cart
 * - https://www.loja.com.br/checkout/?orderFormId=abc123
 * - https://www.loja.com.br/api/checkout/pub/orderForm/abc123
 * - abc123 (ID direto)
 * 
 * @param url URL do carrinho ou ID direto
 * @returns orderFormId extraído
 * @throws Error se não conseguir extrair o ID
 */
export function extractOrderFormId(url: string): string {
  // Se já é um ID (sem barras ou pontos)
  if (/^[a-zA-Z0-9-]+$/.test(url) && url.length > 10) {
    return url;
  }

  // Tenta extrair de query string (?orderFormId=xxx)
  const urlMatch = url.match(/orderFormId=([a-zA-Z0-9-]+)/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Tenta extrair do path (/orderForm/xxx)
  const pathMatch = url.match(/orderForm\/([a-zA-Z0-9-]+)/i);
  if (pathMatch) {
    return pathMatch[1];
  }

  // Tenta extrair ID de formato VTEX padrão (32+ chars hex-like)
  const idMatch = url.match(/([a-f0-9]{32,})/i);
  if (idMatch) {
    return idMatch[1];
  }

  throw new Error(
    `Não foi possível extrair o orderFormId da URL: "${url}". ` +
    'Forneça a URL completa do carrinho ou o ID diretamente.'
  );
}

/**
 * Busca o OrderForm pela API de Checkout da VTEX
 * 
 * Endpoint: GET /api/checkout/pub/orderForm/{orderFormId}
 * 
 * @param orderFormId ID do OrderForm
 * @returns Dados do OrderForm
 * @throws Error se a requisição falhar
 */
export async function getOrderForm(orderFormId: string): Promise<VTEXOrderForm> {
  // Modo mock para desenvolvimento/testes
  if (isMockMode()) {
    console.log('[MOCK] Retornando OrderForm mockado');
    return mockOrderForm;
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);

  /**
   * Endpoint público do Checkout API
   * Documentação: https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm/-orderFormId-
   * 
   * Alternativamente, para acesso administrativo:
   * GET /api/checkout/pvt/orderForm/{orderFormId}
   */
  const url = `${baseUrl}/api/checkout/pub/orderForm/${orderFormId}`;

  console.log(`[VTEX] Buscando OrderForm: ${orderFormId}`);

  const response = await fetch(url, {
    method: 'GET',
    headers,
    // Cache curto para evitar dados desatualizados
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[VTEX] Erro ao buscar OrderForm: ${response.status}`, errorText);
    
    if (response.status === 404) {
      throw new Error(`OrderForm não encontrado: ${orderFormId}`);
    }
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('Credenciais VTEX inválidas ou sem permissão para acessar o OrderForm');
    }

    throw new Error(`Erro ao buscar OrderForm: ${response.status} - ${errorText}`);
  }

  const orderForm: VTEXOrderForm = await response.json();

  console.log(`[VTEX] OrderForm obtido: ${orderForm.items?.length || 0} itens, valor: ${orderForm.value}`);

  return orderForm;
}

/**
 * Busca OrderForm usando endpoint privado (requer mais permissões)
 * Útil quando o endpoint público não está disponível
 */
export async function getOrderFormPrivate(orderFormId: string): Promise<VTEXOrderForm> {
  if (isMockMode()) {
    return mockOrderForm;
  }

  const config = getVTEXConfig();
  const baseUrl = getVTEXBaseUrl(config);
  const headers = getVTEXHeaders(config);

  // Endpoint privado - requer autenticação admin
  const url = `${baseUrl}/api/checkout/pvt/orderForm/${orderFormId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar OrderForm (pvt): ${response.status}`);
  }

  return response.json();
}
