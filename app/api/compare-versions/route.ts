/**
 * API Route para comparação de versões de Budget
 * 
 * POST /api/compare-versions
 *   action=list-versions: Lista versões de um orçamento
 *   action=compare: Compara versão atual com versão selecionada
 * 
 * Documentação:
 * - Master Data API v2 Versions: https://developers.vtex.com/docs/api-reference/master-data-api-v2#get-/api/dataentities/-dataEntityName-/documents/-id-/versions
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getBudget, getBudgetVersions, getBudgetVersion } from '@/lib/vtex/masterData';
import { getMultipleSkuDetails, createWeightMap } from '@/lib/vtex/catalog';
import { normalizeBudget } from '@/lib/compare/normalizers';
import { compareBudgets } from '@/lib/compare/budgetCompare';
import { BudgetComparisonResult, BudgetVersion, ApiError } from '@/lib/compare/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ListVersionsSchema = z.object({
  action: z.literal('list-versions'),
  idBudget: z.union([z.string(), z.number()]).transform(String),
});

const CompareVersionSchema = z.object({
  action: z.literal('compare'),
  documentId: z.string().min(1),
  versionId: z.string().min(1),
  idBudget: z.union([z.string(), z.number()]).transform(String),
});

const RequestSchema = z.discriminatedUnion('action', [
  ListVersionsSchema,
  CompareVersionSchema,
]);

interface ListVersionsResponse {
  documentId: string;
  idBudget: string;
  versions: BudgetVersion[];
  currentUpdatedAt?: string;
}

function generateRequestId(): string {
  return `req_versions_${randomUUID()}`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ListVersionsResponse | BudgetComparisonResult | ApiError>> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => ({}));

    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
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

    const data = validation.data;

    if (data.action === 'list-versions') {
      return handleListVersions(data.idBudget, requestId);
    }

    return handleCompare(data.documentId, data.versionId, data.idBudget, requestId, startTime);
  } catch (error) {
    console.error(`[${requestId}] Erro inesperado:`, error);

    return NextResponse.json<ApiError>(
      {
        error: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar comparação de versões',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        requestId,
      },
      { status: 500 }
    );
  }
}

async function handleListVersions(
  idBudget: string,
  requestId: string
): Promise<NextResponse<ListVersionsResponse | ApiError>> {
  console.log(`[${requestId}] Listando versões para idBudget=${idBudget}...`);

  let budget;
  try {
    budget = await getBudget(idBudget);
  } catch (err) {
    return NextResponse.json<ApiError>(
      {
        error: 'BUDGET_NOT_FOUND',
        message: err instanceof Error ? err.message : `Orçamento não encontrado: ${idBudget}`,
        requestId,
      },
      { status: 404 }
    );
  }

  const documentId = budget.id;

  try {
    const versions = await getBudgetVersions(documentId);

    console.log(`[${requestId}] ${versions.length} versão(ões) encontrada(s)`);

    return NextResponse.json<ListVersionsResponse>({
      documentId,
      idBudget,
      versions,
      currentUpdatedAt: budget.updatedAt,
    });
  } catch (err) {
    return NextResponse.json<ApiError>(
      {
        error: 'VERSIONS_FETCH_ERROR',
        message: err instanceof Error ? err.message : 'Erro ao listar versões',
        requestId,
      },
      { status: 500 }
    );
  }
}

async function handleCompare(
  documentId: string,
  versionId: string,
  idBudget: string,
  requestId: string,
  startTime: number
): Promise<NextResponse<BudgetComparisonResult | ApiError>> {
  console.log(`[${requestId}] Comparando versão atual com versão ${versionId}...`);

  try {
    const [currentResult, versionResult] = await Promise.allSettled([
      getBudget(idBudget),
      getBudgetVersion(documentId, versionId),
    ]);

    if (currentResult.status === 'rejected') {
      return NextResponse.json<ApiError>(
        {
          error: 'CURRENT_BUDGET_ERROR',
          message: currentResult.reason instanceof Error
            ? currentResult.reason.message
            : 'Não foi possível buscar o orçamento atual',
          requestId,
        },
        { status: 404 }
      );
    }

    if (versionResult.status === 'rejected') {
      return NextResponse.json<ApiError>(
        {
          error: 'VERSION_NOT_FOUND',
          message: versionResult.reason instanceof Error
            ? versionResult.reason.message
            : `Versão ${versionId} não encontrada`,
          requestId,
        },
        { status: 404 }
      );
    }

    const currentBudget = currentResult.value;
    const versionBudget = versionResult.value;

    console.log(`[${requestId}] Budget atual obtido - id: ${currentBudget.id}, items: ${currentBudget.items?.length || 0}`);
    console.log(`[${requestId}] Versão obtida - id: ${versionBudget.id}, items: ${versionBudget.items?.length || 0}`);

    if (!versionBudget.items) {
      console.warn(`[${requestId}] versionBudget.items é undefined/null, usando array vazio`);
      versionBudget.items = [];
    }

    if (!currentBudget.items) {
      console.warn(`[${requestId}] currentBudget.items é undefined/null, usando array vazio`);
      currentBudget.items = [];
    }

    console.log(`[${requestId}] Normalizando budgets...`);
    const normalizedCurrent = normalizeBudget(currentBudget);
    const normalizedVersion = normalizeBudget(versionBudget);
    console.log(`[${requestId}] Normalização OK - atual: ${normalizedCurrent.items.length} itens, versão: ${normalizedVersion.items.length} itens`);

    const allSkuIds = [
      ...normalizedCurrent.items.map(item => item.skuId),
      ...normalizedVersion.items.map(item => item.skuId),
    ];
    const uniqueSkuIds = [...new Set(allSkuIds)];

    const skuDetailsMap = await getMultipleSkuDetails(uniqueSkuIds);
    const skuWeights = createWeightMap(skuDetailsMap);

    const metadata = {
      budget1Id: `${idBudget} (atual)`,
      budget2Id: `${idBudget} (versão ${versionId})`,
      comparedAt: new Date().toISOString(),
      requestId,
    };

    const result = compareBudgets(
      normalizedCurrent,
      normalizedVersion,
      skuWeights,
      metadata
    );

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Comparação de versões concluída em ${duration}ms - ${result.summary.totalDiffs} divergências`);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[${requestId}] Erro na comparação de versões:`, error);

    return NextResponse.json<ApiError>(
      {
        error: 'COMPARE_ERROR',
        message: 'Erro ao processar comparação de versões',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        requestId,
      },
      { status: 500 }
    );
  }
}

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
