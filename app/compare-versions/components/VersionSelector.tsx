'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BudgetVersion } from '@/lib/compare/types';

interface VersionSelectorProps {
  versions: BudgetVersion[];
  idBudget: string;
  currentUpdatedAt?: string;
  onSelect: (versionId: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function VersionSelector({
  versions,
  idBudget,
  currentUpdatedAt,
  onSelect,
  onBack,
  isLoading = false,
}: VersionSelectorProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (versions.length === 0) {
    return (
      <Card title="Sem versões anteriores">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            O orçamento <strong>{idBudget}</strong> não possui versões anteriores para comparação.
          </p>
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`Versões do Orçamento ${idBudget}`}
      subtitle="Selecione uma versão anterior para comparar com a versão atual"
    >
      <div className="space-y-4">
        {/* Versão atual (referência) */}
        <div className="p-4 rounded-lg border-2 border-green-main/30 bg-green-main/5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-main" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Versão Atual
              </p>
              {currentUpdatedAt && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Última atualização: {formatDate(currentUpdatedAt)}
                </p>
              )}
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-main/10 text-green-main rounded-full">
              Referência
            </span>
          </div>
        </div>

        {/* Lista de versões anteriores */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Versões anteriores ({versions.length}):
          </p>
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => onSelect(version.id)}
              disabled={isLoading}
              className={`
                w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700
                text-left transition-all duration-200
                hover:border-brand-cyan hover:bg-brand-cyan/5
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-brand-cyan/50
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    Versão: {version.id.slice(0, 12)}...
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(version.date)}
                    </span>
                    {version.author && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        • {version.author}
                      </span>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            Voltar
          </Button>
        </div>
      </div>
    </Card>
  );
}
