"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Play,
  TerminalSquare,
  UploadCloud,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  SpreadsheetValidationEvent,
  SpreadsheetValidationLog,
  SpreadsheetValidationStatus,
  SpreadsheetValidationSummary,
} from "@/lib/spreadsheet-validation";

export function SpreadsheetValidationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<SpreadsheetValidationStatus>("idle");
  const [logs, setLogs] = useState<SpreadsheetValidationLog[]>([]);
  const [summary, setSummary] = useState<SpreadsheetValidationSummary | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ processed: 0, total: 0, updated: 0, skipped: 0, failed: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const progressPercent = useMemo(() => {
    if (progress.total === 0) return 0;
    return Math.round((progress.processed / progress.total) * 100);
  }, [progress.processed, progress.total]);

  const running = status === "validating" || status === "processing";
  const visibleLogs = logs.slice(-160);

  async function runValidation() {
    if (!file || running) return;

    setStatus("validating");
    setError("");
    setLogs([]);
    setSummary(null);
    setProgress({ processed: 0, total: 0, updated: 0, skipped: 0, failed: 0 });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/spreadsheet-validation", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null);
        setStatus("error");
        setError(body?.message ?? "Não foi possível validar a planilha.");
        return;
      }

      setStatus("processing");
      await readEvents(response.body);
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Falha de rede ao enviar a planilha.");
    }
  }

  async function readEvents(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) consumeEvent(JSON.parse(line) as SpreadsheetValidationEvent);
      }
      if (buffer.trim()) consumeEvent(JSON.parse(buffer) as SpreadsheetValidationEvent);
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Erro ao ler o progresso.");
    }
  }

  function consumeEvent(event: SpreadsheetValidationEvent) {
    if (event.type === "start") {
      setProgress((current) => ({ ...current, total: event.totalRows }));
      return;
    }

    if (event.type === "progress") {
      setProgress({
        processed: event.processed,
        total: event.total,
        updated: event.updated,
        skipped: event.skipped,
        failed: event.failed,
      });
      setLogs((current) => [...current, event.log]);
      return;
    }

    if (event.type === "complete") {
      setSummary(event.summary);
      setLogs(event.logs);
      setStatus("completed");
      return;
    }

    setStatus("error");
    setError(event.message);
  }

  function downloadJson() {
    downloadFile(
      "spreadsheet-validation-results.json",
      JSON.stringify({ summary, logs }, null, 2),
      "application/json",
    );
  }

  function downloadCsv() {
    const header = "line,email,cnpjOriginal,cnpj,status,reason,durationMs";
    const rows = logs.map((log) =>
      [
        log.line,
        log.email,
        log.cnpjOriginal,
        log.cnpj,
        log.status,
        log.reason,
        log.durationMs,
      ]
        .map(csvValue)
        .join(","),
    );
    downloadFile("spreadsheet-validation-results.csv", [header, ...rows].join("\n"), "text/csv");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <Badge variant="secondary" className="gap-1.5">
            <FileSpreadsheet className="size-3" />
            Validação operacional
          </Badge>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Validação de Planilhas
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Envie um CSV com `email` e `cnpjDoc` para validar integradores no Master Data e redefinir `has_used_coupon` quando necessário.
            </p>
          </div>
        </div>
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Resumo da execução</CardTitle>
            <CardDescription>Status atual da última planilha enviada.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Processadas" value={progress.processed} />
            <Metric label="Atualizadas" value={progress.updated} />
            <Metric label="Ignoradas" value={progress.skipped} />
            <Metric label="Falhas" value={progress.failed} tone={progress.failed > 0 ? "danger" : "default"} />
          </CardContent>
        </Card>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Execução interrompida</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Arquivo</CardTitle>
            <CardDescription>Use o mesmo formato do `ativa.csv`: delimitador `;` e cabeçalhos `email;cnpjDoc`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              className={cn(
                "rounded-xl border border-dashed bg-muted/20 p-5 transition-colors",
                file && "border-primary/50 bg-primary/5",
              )}
            >
              <Label htmlFor="spreadsheet-file" className="flex cursor-pointer flex-col items-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud />
                </span>
                <span className="space-y-1">
                  <span className="block font-medium">{file ? file.name : "Selecionar planilha CSV"}</span>
                  <span className="block text-xs text-muted-foreground">
                    A validação de colunas acontece antes da execução.
                  </span>
                </span>
              </Label>
              <Input
                ref={inputRef}
                id="spreadsheet-file"
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                disabled={running}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <Button className="w-full" size="lg" disabled={!file || running} onClick={runValidation}>
              {running ? <TerminalSquare className="animate-pulse" /> : <Play />}
              {running ? "Processando..." : "Executar validação"}
            </Button>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{statusLabel(status)}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {summary && (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Button variant="outline" onClick={downloadJson}>
                  <Download />
                  Baixar JSON
                </Button>
                <Button variant="outline" onClick={downloadCsv}>
                  <Download />
                  Baixar CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Logs</CardTitle>
              <CardDescription>
                Últimos eventos da execução. O arquivo de download contém todos os registros.
              </CardDescription>
            </div>
            {summary && (
              <Badge variant={summary.failed > 0 ? "destructive" : "default"} className="gap-1">
                <CheckCircle2 className="size-3" />
                Concluído
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="h-[420px] overflow-auto rounded-xl border bg-background p-3 font-mono text-xs">
              {visibleLogs.length === 0 ? (
                <p className="text-muted-foreground">Nenhum log ainda.</p>
              ) : (
                <div className="space-y-2">
                  {visibleLogs.map((log) => (
                    <div key={`${log.line}-${log.cnpj}-${log.status}`} className="grid gap-1 rounded-lg bg-muted/30 p-2 sm:grid-cols-[80px_minmax(0,1fr)]">
                      <span className={statusColor(log.status)}>linha {log.line}</span>
                      <span className="min-w-0 break-words">
                        {log.status.toUpperCase()} {log.cnpj || log.cnpjOriginal} - {log.reason}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "danger" }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-semibold", tone === "danger" && "text-destructive")}>{value}</div>
    </div>
  );
}

function statusLabel(status: SpreadsheetValidationStatus): string {
  const labels: Record<SpreadsheetValidationStatus, string> = {
    idle: "Aguardando arquivo",
    validating: "Validando estrutura",
    processing: "Processando linhas",
    completed: "Concluído",
    error: "Erro",
  };
  return labels[status];
}

function statusColor(status: SpreadsheetValidationLog["status"]): string {
  if (status === "updated") return "text-primary";
  if (status === "failed") return "text-destructive";
  return "text-muted-foreground";
}

function csvValue(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadFile(fileName: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
