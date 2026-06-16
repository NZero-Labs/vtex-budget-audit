import {
  REQUIRED_SPREADSHEET_COLUMNS,
  SpreadsheetParseResult,
  SpreadsheetRow,
} from "./types";

export function parseSpreadsheetCsv(text: string): SpreadsheetParseResult {
  const table = parseDelimited(text.replace(/^\uFEFF/, ""), ";");
  const [rawHeaders, ...rawRows] = table;
  const headers = (rawHeaders ?? []).map((header) => header.trim());
  const missingColumns = REQUIRED_SPREADSHEET_COLUMNS.filter(
    (column) => !headers.includes(column),
  );

  if (missingColumns.length > 0) {
    return { rows: [], missingColumns };
  }

  const emailIndex = headers.indexOf("email");
  const cnpjIndex = headers.indexOf("cnpjDoc");
  const rows: SpreadsheetRow[] = rawRows.flatMap((row, index) => {
    if (row.every((value) => value.trim() === "")) return [];
    return [
      {
        line: index + 2,
        email: row[emailIndex]?.trim() ?? "",
        cnpjDoc: row[cnpjIndex]?.trim() ?? "",
      },
    ];
  });

  return { rows, missingColumns: [] };
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value !== "" || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}
