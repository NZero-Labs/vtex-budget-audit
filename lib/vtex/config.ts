/**
 * Configuração e utilitários para conexão com APIs VTEX
 * 
 * Referências:
 * - Checkout API: https://developers.vtex.com/docs/api-reference/checkout-api
 * - Master Data API v2: https://developers.vtex.com/docs/api-reference/master-data-api-v2
 * - io-clients: https://github.com/vtex/io-clients
 * - node-vtex-api: https://github.com/vtex/node-vtex-api
 */

/**
 * Configurações da conta VTEX
 * Lidas das variáveis de ambiente
 */
export interface VTEXConfig {
  account: string;
  environment: string;
  appKey: string;
  appToken: string;
  masterDataEntity: string;
}

/**
 * Obtém a configuração VTEX das variáveis de ambiente
 * @throws Error se variáveis obrigatórias não estiverem definidas
 */
export function getVTEXConfig(): VTEXConfig {
  const account = process.env.VTEX_ACCOUNT;
  const environment = process.env.VTEX_ENVIRONMENT || 'vtexcommercestable';
  const appKey = process.env.VTEX_APP_KEY;
  const appToken = process.env.VTEX_APP_TOKEN;
  const masterDataEntity = process.env.MASTERDATA_ENTITY || 'budget';

  if (!account) {
    throw new Error('VTEX_ACCOUNT não configurado. Defina a variável de ambiente.');
  }

  if (!appKey || !appToken) {
    throw new Error('VTEX_APP_KEY e VTEX_APP_TOKEN são obrigatórios. Configure as variáveis de ambiente.');
  }

  return {
    account,
    environment,
    appKey,
    appToken,
    masterDataEntity,
  };
}

/**
 * Monta a URL base da API VTEX
 */
export function getVTEXBaseUrl(config: VTEXConfig): string {
  return `https://${config.account}.${config.environment}.com.br`;
}

/**
 * Headers padrão para autenticação na API VTEX
 */
export function getVTEXHeaders(config: VTEXConfig): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-VTEX-API-AppKey': config.appKey,
    'X-VTEX-API-AppToken': config.appToken,
  };
}

/**
 * Verifica se o modo mock está ativo
 * Útil para desenvolvimento sem conexão real com VTEX
 */
export function isMockMode(): boolean {
  return process.env.USE_MOCK_DATA === 'true';
}

/**
 * Thresholds configuráveis para criticidade
 */
export function getCriticalityThresholds() {
  return {
    /** Diferença percentual para marcar como crítico (ex: 0.5 = 0.5%) */
    percentageThreshold: parseFloat(process.env.CRITICAL_DIFF_THRESHOLD_PCT || '0.5'),
    /** Diferença absoluta em reais para marcar como crítico */
    absoluteThreshold: parseFloat(process.env.CRITICAL_DIFF_THRESHOLD_ABS || '50'),
  };
}
