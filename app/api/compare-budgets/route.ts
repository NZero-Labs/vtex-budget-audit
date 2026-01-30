/**
 * API Route para comparação de Budget vs Budget
 * 
 * POST /api/compare-budgets
 * 
 * Compara dois orçamentos, incluindo peso dos itens via API de Catálogo.
 * 
 * Documentação das APIs VTEX utilizadas:
 * - Master Data API v2: https://developers.vtex.com/docs/api-reference/master-data-api-v2
 * - Catalog API: https://developers.vtex.com/docs/api-reference/catalog-api
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getBudget } from '@/lib/vtex/masterData';
import { getMultipleSkuDetails, createWeightMap } from '@/lib/vtex/catalog';
import { normalizeBudget } from '@/lib/compare/normalizers';
import { compareBudgets } from '@/lib/compare/budgetCompare';
import { BudgetComparisonResult, ApiError } from '@/lib/compare/types';

/**
 * Schema de validação do request
 */
const CompareBudgetsRequestSchema = z.object({
  idBudget1: z.union([z.string(), z.number()]).transform(String),
  idBudget2: z.union([z.string(), z.number()]).transform(String),
});

/**
 * Gera ID único para rastreamento da requisição
 */
function generateRequestId(): string {
  return `req_budget_${randomUUID()}`;
}

/**
 * Handler POST para comparação de dois orçamentos
 */
export async function POST(request: NextRequest): Promise<NextResponse<BudgetComparisonResult | ApiError>> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  console.log(`[${requestId}] Iniciando comparação Budget vs Budget...`);

  try {
    // 1. Parse e validação do body
    const body = await request.json().catch(() => ({}));

    const validation = CompareBudgetsRequestSchema.safeParse(body);
    if (!validation.success) {
      console.log(`[${requestId}] Erro de validação:`, validation.error.errors);
      return NextResponse.json<ApiError>(
        {
          error: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: validation.error.errors,
          requestId,
        },
        { status: 400 }
      );
    }

    const { idBudget1, idBudget2 } = validation.data;

    // 2. Buscar ambos os orçamentos em paralelo
    console.log(`[${requestId}] Buscando orçamentos ${idBudget1} e ${idBudget2}...`);

    const [budget1Result, budget2Result] = await Promise.allSettled([
      getBudget(idBudget1),
      getBudget(idBudget2),
    ]);

    // Verificar erros na busca do Budget 1
    if (budget1Result.status === 'rejected') {
      console.error(`[${requestId}] Erro ao buscar Budget 1:`, budget1Result.reason);
      return NextResponse.json<ApiError>(
        {
          error: 'BUDGET1_NOT_FOUND',
          message: budget1Result.reason instanceof Error
            ? budget1Result.reason.message
            : `Não foi possível buscar o orçamento 1 (${idBudget1})`,
          requestId,
        },
        { status: 404 }
      );
    }

    // Verificar erros na busca do Budget 2
    if (budget2Result.status === 'rejected') {
      console.error(`[${requestId}] Erro ao buscar Budget 2:`, budget2Result.reason);
      return NextResponse.json<ApiError>(
        {
          error: 'BUDGET2_NOT_FOUND',
          message: budget2Result.reason instanceof Error
            ? budget2Result.reason.message
            : `Não foi possível buscar o orçamento 2 (${idBudget2})`,
          requestId,
        },
        { status: 404 }
      );
    }

    const budget1 = budget1Result.value;
    const budget2 = budget2Result.value;

    console.log(`[${requestId}] Orçamentos obtidos - Budget1: ${budget1.items?.length || 0} itens, Budget2: ${budget2.items?.length || 0} itens`);

    // 3. Normalizar estruturas
    const normalizedBudget1 = normalizeBudget(budget1);
    const normalizedBudget2 = normalizeBudget(budget2);

    // 4. Coletar todos os SKU IDs únicos
    const allSkuIds = [
      ...normalizedBudget1.items.map(item => item.skuId),
      ...normalizedBudget2.items.map(item => item.skuId),
    ];
    const uniqueSkuIds = [...new Set(allSkuIds)];

    console.log(`[${requestId}] Buscando peso de ${uniqueSkuIds.length} SKUs...`);

    // 5. Buscar detalhes dos SKUs (incluindo peso) em paralelo
    const skuDetailsMap = await getMultipleSkuDetails(uniqueSkuIds);
    const skuWeights = createWeightMap(skuDetailsMap);

    console.log(`[${requestId}] Pesos obtidos para ${skuWeights.size} SKUs`);

    // 6. Executar comparação
    const metadata = {
      budget1Id: idBudget1,
      budget2Id: idBudget2,
      comparedAt: new Date().toISOString(),
      requestId,
    };

    const result = compareBudgets(
      normalizedBudget1,
      normalizedBudget2,
      skuWeights,
      metadata
    );

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Comparação concluída em ${duration}ms - ${result.summary.totalDiffs} divergências encontradas`);
    console.log(`[${requestId}] Peso total: Budget1=${result.weightInfo.budget1.totalWeight.toFixed(2)}kg, Budget2=${result.weightInfo.budget2.totalWeight.toFixed(2)}kg`);

    return NextResponse.json(result);

  } catch (error) {
    console.error(`[${requestId}] Erro inesperado:`, error);

    return NextResponse.json<ApiError>(
      {
        error: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar comparação de orçamentos',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        requestId,
      },
      { status: 500 }
    );
  }
}

/**
 * Handler OPTIONS para CORS (se necessário)
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
