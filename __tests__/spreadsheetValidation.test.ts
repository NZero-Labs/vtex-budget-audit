import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { parseSpreadsheetCsv } from "@/lib/spreadsheet-validation/csv";
import {
  normalizeCnpj,
  processSpreadsheetRows,
  shouldResetCouponFlag,
  type IntegratorClient,
} from "@/lib/spreadsheet-validation/executor";

describe("parseSpreadsheetCsv", () => {
  it("deve ler o CSV de exemplo com as colunas esperadas", () => {
    const csv = readFileSync(resolve(process.cwd(), "ativa.csv"), "utf8");
    const result = parseSpreadsheetCsv(csv);

    expect(result.missingColumns).toEqual([]);
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].line).toBe(2);
    expect(result.rows[0].email).toContain("@");
    expect(result.rows[0].cnpjDoc).not.toBe("");
  });

  it("deve reportar colunas obrigatorias ausentes", () => {
    const result = parseSpreadsheetCsv("email;nome\na@b.com;Teste");

    expect(result.rows).toEqual([]);
    expect(result.missingColumns).toEqual(["cnpjDoc"]);
  });
});

describe("spreadsheet validation executor", () => {
  it("deve normalizar CNPJ preservando apenas digitos", () => {
    expect(normalizeCnpj("12.345.678/0001-90")).toBe("12345678000190");
  });

  it("deve atualizar apenas flags true ou vazias", () => {
    expect(shouldResetCouponFlag(true)).toBe(true);
    expect(shouldResetCouponFlag("true")).toBe(true);
    expect(shouldResetCouponFlag(null)).toBe(true);
    expect(shouldResetCouponFlag(false)).toBe(false);
    expect(shouldResetCouponFlag("false")).toBe(false);
  });

  it("deve processar linhas com atualizacoes, ignorados e falhas", async () => {
    const updatedIds: string[] = [];
    const client: IntegratorClient = {
      async searchByDocument(document) {
        if (document === "11222333000144") {
          return [{ id: "needs-reset", has_used_coupon: true }];
        }

        if (document === "22333444000155") {
          return [{ id: "already-ok", has_used_coupon: "false" }];
        }

        return [];
      },
      async resetCouponFlag(documentId) {
        updatedIds.push(documentId);
      },
    };

    const result = await processSpreadsheetRows(
      [
        { line: 2, email: "one@example.com", cnpjDoc: "11.222.333/0001-44" },
        { line: 3, email: "two@example.com", cnpjDoc: "22.333.444/0001-55" },
        { line: 4, email: "bad@example.com", cnpjDoc: "123" },
      ],
      client,
      { requestId: "test-request", concurrency: 2 }
    );

    expect(updatedIds).toEqual(["needs-reset"]);
    expect(result.summary.processed).toBe(3);
    expect(result.summary.updated).toBe(1);
    expect(result.summary.skipped).toBe(1);
    expect(result.summary.failed).toBe(1);
    expect(result.logs.map((log) => log.status).sort()).toEqual(["failed", "skipped", "updated"]);
  });
});
