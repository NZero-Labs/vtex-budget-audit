export const REQUIRED_SPREADSHEET_COLUMNS = ["email", "cnpjDoc"] as const;

export type SpreadsheetValidationStatus =
  | "idle"
  | "validating"
  | "processing"
  | "completed"
  | "error";

export interface SpreadsheetRow {
  line: number;
  email: string;
  cnpjDoc: string;
}

export interface SpreadsheetValidationLog {
  line: number;
  email: string;
  cnpjOriginal: string;
  cnpj: string;
  status: "updated" | "skipped" | "failed";
  reason: string;
  durationMs: number;
}

export interface SpreadsheetValidationSummary {
  requestId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  totalRows: number;
  processed: number;
  updated: number;
  skipped: number;
  failed: number;
}

export type SpreadsheetValidationEvent =
  | {
      type: "start";
      requestId: string;
      totalRows: number;
      startedAt: string;
    }
  | {
      type: "progress";
      processed: number;
      total: number;
      updated: number;
      skipped: number;
      failed: number;
      log: SpreadsheetValidationLog;
    }
  | {
      type: "complete";
      requestId: string;
      summary: SpreadsheetValidationSummary;
      logs: SpreadsheetValidationLog[];
    }
  | {
      type: "error";
      requestId: string;
      message: string;
    };

export interface SpreadsheetParseResult {
  rows: SpreadsheetRow[];
  missingColumns: string[];
}

export interface SpreadsheetValidationResult {
  summary: SpreadsheetValidationSummary;
  logs: SpreadsheetValidationLog[];
}
