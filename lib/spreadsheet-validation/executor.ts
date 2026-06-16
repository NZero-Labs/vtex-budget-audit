import {
  SpreadsheetRow,
  SpreadsheetValidationLog,
  SpreadsheetValidationResult,
  SpreadsheetValidationSummary,
} from "./types";

export interface IntegratorRecord {
  id?: string;
  documentId?: string;
  _id?: string;
  integratorId?: string;
  has_used_coupon?: unknown;
  [key: string]: unknown;
}

export interface IntegratorClient {
  searchByDocument(document: string): Promise<IntegratorRecord[]>;
  resetCouponFlag(documentId: string): Promise<void>;
}

interface ProcessRowsOptions {
  requestId: string;
  concurrency?: number;
  onProgress?: (snapshot: {
    processed: number;
    total: number;
    updated: number;
    skipped: number;
    failed: number;
    log: SpreadsheetValidationLog;
  }) => void;
}

export function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function shouldResetCouponFlag(value: unknown): boolean {
  return value === true || value === "true" || value == null;
}

export function getIntegratorDocumentId(record: IntegratorRecord): string | null {
  const id = record.id ?? record.documentId ?? record._id ?? record.integratorId;
  return typeof id === "string" && id.trim() ? id : null;
}

export async function processSpreadsheetRows(
  rows: SpreadsheetRow[],
  client: IntegratorClient,
  options: ProcessRowsOptions,
): Promise<SpreadsheetValidationResult> {
  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const logs: SpreadsheetValidationLog[] = [];
  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let nextIndex = 0;
  const workerCount = Math.min(options.concurrency ?? 5, rows.length);

  async function runNext(): Promise<void> {
    while (nextIndex < rows.length) {
      const row = rows[nextIndex];
      nextIndex += 1;
      const log = await processSpreadsheetRow(row, client);
      logs.push(log);
      processed += 1;
      if (log.status === "updated") updated += 1;
      if (log.status === "skipped") skipped += 1;
      if (log.status === "failed") failed += 1;
      options.onProgress?.({
        processed,
        total: rows.length,
        updated,
        skipped,
        failed,
        log,
      });
    }
  }

  await Promise.all(Array.from({ length: workerCount }, runNext));

  const finishedAtMs = Date.now();
  const summary: SpreadsheetValidationSummary = {
    requestId: options.requestId,
    startedAt,
    finishedAt: new Date(finishedAtMs).toISOString(),
    durationMs: finishedAtMs - startedAtMs,
    totalRows: rows.length,
    processed,
    updated,
    skipped,
    failed,
  };

  return { summary, logs };
}

async function processSpreadsheetRow(
  row: SpreadsheetRow,
  client: IntegratorClient,
): Promise<SpreadsheetValidationLog> {
  const startedAt = Date.now();
  const cnpj = normalizeCnpj(row.cnpjDoc);

  try {
    if (!/^\d{14}$/.test(cnpj)) {
      return createLog(row, cnpj, "failed", "CNPJ inválido", startedAt);
    }

    const integrators = await client.searchByDocument(cnpj);
    const integrator = integrators[0];
    if (!integrator) {
      return createLog(row, cnpj, "failed", "Integrador não encontrado", startedAt);
    }

    const documentId = getIntegratorDocumentId(integrator);
    if (!documentId) {
      return createLog(row, cnpj, "failed", "Integrador sem ID de documento", startedAt);
    }

    if (!shouldResetCouponFlag(integrator.has_used_coupon)) {
      return createLog(row, cnpj, "skipped", "has_used_coupon já está false", startedAt);
    }

    await client.resetCouponFlag(documentId);
    const suffix = integrators.length > 1 ? " (mais de um integrador encontrado)" : "";
    return createLog(row, cnpj, "updated", `has_used_coupon atualizado para false${suffix}`, startedAt);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Erro desconhecido";
    return createLog(row, cnpj, "failed", reason, startedAt);
  }
}

function createLog(
  row: SpreadsheetRow,
  cnpj: string,
  status: SpreadsheetValidationLog["status"],
  reason: string,
  startedAt: number,
): SpreadsheetValidationLog {
  return {
    line: row.line,
    email: row.email,
    cnpjOriginal: row.cnpjDoc,
    cnpj,
    status,
    reason,
    durationMs: Date.now() - startedAt,
  };
}
