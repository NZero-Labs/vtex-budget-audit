/**
 * API Route para comparação de Budget vs OrderForm
 * 
 * POST /api/compare
 * 
 * Orquestra as chamadas para VTEX, normaliza os dados e executa a comparação.
 * 
 * Documentação das APIs VTEX utilizadas:
 * - Checkout API: https://developers.vtex.com/docs/api-reference/checkout-api
 * - Master Data API v2: https://developers.vtex.com/docs/api-reference/master-data-api-v2
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'crypto';
import { getOrderForm, extractOrderFormId } from '@/lib/vtex/orderForm';
import { getBudget } from '@/lib/vtex/masterData';
import { normalizeOrderForm, normalizeBudget } from '@/lib/compare/normalizers';
import {
  compareItems,
  compareTotals,
  compareShipping,
  comparePromotions,
  generateSummary,
} from '@/lib/compare/compareUtils';
import { ComparisonResult, ApiError } from '@/lib/compare/types';

/**
 * Schema de validação do request
 */
const CompareRequestSchema = z.object({
  orderFormUrl: z.string().min(1, 'URL do carrinho é obrigatória'),
  idBudget: z.union([z.string(), z.number()]).transform(String),
});

/**
 * Gera ID único para rastreamento da requisição
 */
function generateRequestId(): string {
  // Usa timestamp + random para ID único
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handler POST para comparação
 */
export async function POST(request: NextRequest): Promise<NextResponse<ComparisonResult | ApiError>> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  console.log(`[${requestId}] Iniciando comparação...`);

  try {
    // 1. Parse e validação do body
    const body = await request.json().catch(() => ({}));
    
    const validation = CompareRequestSchema.safeParse(body);
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

    const { orderFormUrl, idBudget } = validation.data;

    // 2. Extrair orderFormId da URL
    let orderFormId: string;
    try {
      orderFormId = extractOrderFormId(orderFormUrl);
      console.log(`[${requestId}] OrderFormId extraído: ${orderFormId}`);
    } catch (error) {
      return NextResponse.json<ApiError>(
        {
          error: 'INVALID_URL',
          message: error instanceof Error ? error.message : 'URL do carrinho inválida',
          requestId,
        },
        { status: 400 }
      );
    }

    // 3. Buscar dados em paralelo
    console.log(`[${requestId}] Buscando OrderForm e Budget...`);
    
    const [orderFormResult, budgetResult] = await Promise.allSettled([
      getOrderForm(orderFormId),
      getBudget(idBudget),
    ]);

    // Verificar erros na busca do OrderForm
    if (orderFormResult.status === 'rejected') {
      console.error(`[${requestId}] Erro ao buscar OrderForm:`, orderFormResult.reason);
      return NextResponse.json<ApiError>(
        {
          error: 'ORDERFORM_NOT_FOUND',
          message: orderFormResult.reason instanceof Error 
            ? orderFormResult.reason.message 
            : 'Não foi possível buscar o carrinho',
          requestId,
        },
        { status: 404 }
      );
    }

    // Verificar erros na busca do Budget
    if (budgetResult.status === 'rejected') {
      console.error(`[${requestId}] Erro ao buscar Budget:`, budgetResult.reason);
      return NextResponse.json<ApiError>(
        {
          error: 'BUDGET_NOT_FOUND',
          message: budgetResult.reason instanceof Error 
            ? budgetResult.reason.message 
            : 'Não foi possível buscar o orçamento',
          requestId,
        },
        { status: 404 }
      );
    }

    const orderForm = orderFormResult.value;
    const budget = budgetResult.value;

    console.log(`[${requestId}] Dados obtidos - OrderForm: ${orderForm.items?.length || 0} itens, Budget: ${budget.items?.length || 0} itens`);

    // 4. Normalizar estruturas
    const normalizedCart = normalizeOrderForm(orderForm);
    const normalizedBudget = normalizeBudget(budget);

    // 5. Executar comparações
    const itemDiffs = compareItems(normalizedBudget.items, normalizedCart.items);
    const totalsDiff = compareTotals(normalizedBudget.totals, normalizedCart.totals);
    const shippingDiff = compareShipping(normalizedBudget.shipping, normalizedCart.shipping);
    const promoDiffs = comparePromotions(normalizedBudget.promotions, normalizedCart.promotions);

    // 6. Gerar resumo
    const summary = generateSummary(itemDiffs, totalsDiff, shippingDiff, promoDiffs);

    // 7. Montar resultado
    const result: ComparisonResult = {
      summary,
      itemDiffs,
      totalsDiff,
      shippingDiff,
      promoDiffs,
      metadata: {
        orderFormId,
        budgetId: String(idBudget),
        comparedAt: new Date().toISOString(),
        requestId,
      },
    };

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Comparação concluída em ${duration}ms - ${summary.totalDiffs} divergências encontradas`);

    return NextResponse.json(result);

  } catch (error) {
    console.error(`[${requestId}] Erro inesperado:`, error);
    
    return NextResponse.json<ApiError>(
      {
        error: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar comparação',
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
