import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  parseSpreadsheetCsv,
  processSpreadsheetRows,
  type SpreadsheetRow,
} from "@/lib/spreadsheet-validation";
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

  const formData = await readFormData(request);
  if (!formData) {
    return NextResponse.json(
      {
        error: "INVALID_FORM",
        message: "Não foi possível ler o arquivo enviado.",
        requestId,
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!isUploadFile(file)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Envie um arquivo CSV." },
      { status: 400 },
    );
  }

  try {
    const parsed = parseSpreadsheetCsv(await file.text());

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
        {
          error: "EMPTY_FILE",
          message: "Nenhuma linha encontrada para processar.",
          requestId,
        },
        { status: 400 },
      );
    }

    return buildValidationStreamResponse(requestId, parsed.rows);
  } catch (error) {
    console.error(`[${requestId}] Erro ao preparar arquivo:`, error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Não foi possível preparar a planilha para processamento.",
        requestId,
      },
      { status: 500 },
    );
  }
}

async function readFormData(request: NextRequest) {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value === "object" &&
    "text" in value &&
    typeof value.text === "function"
  );
}

function buildValidationStreamResponse(requestId: string, rows: SpreadsheetRow[]) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        const startedAt = new Date().toISOString();
        console.log(
          `[${requestId}] Iniciando validação de planilha: ${rows.length} linhas`,
        );
        send({ type: "start", requestId, totalRows: rows.length, startedAt });

        const client = createVTEXIntegratorClient();
        const result = await processSpreadsheetRows(rows, client, {
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
