import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { parseSpreadsheetCsv, processSpreadsheetRows } from "@/lib/spreadsheet-validation";
import { createVTEXIntegratorClient } from "@/lib/vtex/integrators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Autenticação necessária" },
      { status: 401 },
    );
  }

  const requestId = `req_sheet_${randomUUID()}`;
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Envie um arquivo CSV." },
      { status: 400 },
    );
  }

  const content = await file.text();
  const parsed = parseSpreadsheetCsv(content);

  if (parsed.missingColumns.length > 0) {
    return NextResponse.json(
      {
        error: "MISSING_COLUMNS",
        message: `Colunas obrigatórias ausentes: ${parsed.missingColumns.join(", ")}`,
        missingColumns: parsed.missingColumns,
        requestId,
      },
      { status: 400 },
    );
  }

  if (parsed.rows.length === 0) {
    return NextResponse.json(
      { error: "EMPTY_FILE", message: "Nenhuma linha encontrada para processar.", requestId },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      const startedAt = new Date().toISOString();
      console.log(`[${requestId}] Iniciando validação de planilha: ${parsed.rows.length} linhas`);
      send({ type: "start", requestId, totalRows: parsed.rows.length, startedAt });

      try {
        const client = createVTEXIntegratorClient();
        const result = await processSpreadsheetRows(parsed.rows, client, {
          requestId,
          concurrency: 5,
          onProgress(snapshot) {
            send({ type: "progress", ...snapshot });
          },
        });

        console.log(
          `[${requestId}] Validação concluída em ${result.summary.durationMs}ms: ${result.summary.updated} atualizados, ${result.summary.skipped} ignorados, ${result.summary.failed} falhas`,
        );
        send({ type: "complete", requestId, ...result });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        console.error(`[${requestId}] Erro na validação de planilha:`, error);
        send({ type: "error", requestId, message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
}
