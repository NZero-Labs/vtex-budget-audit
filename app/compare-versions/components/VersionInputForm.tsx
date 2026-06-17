'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface VersionInputFormProps {
  onSubmit: (data: { idBudget: string }) => void;
  isLoading?: boolean;
}

export function VersionInputForm({ onSubmit, isLoading = false }: VersionInputFormProps) {
  const [idBudget, setIdBudget] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!idBudget.trim()) {
      setError('ID do Orçamento é obrigatório');
      return;
    }

    setError(null);
    onSubmit({ idBudget: idBudget.trim() });
  };

  return (
    <Card title="Comparar Versões" subtitle="Informe o ID do orçamento para visualizar o histórico de versões">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="idBudget"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            ID do Orçamento
          </label>
          <input
            type="text"
            id="idBudget"
            value={idBudget}
            onChange={(e) => setIdBudget(e.target.value)}
            placeholder="Ex: 12345"
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors
              ${error
                ? 'border-status-error focus:border-status-error focus:ring-status-error'
                : 'border-gray-300 dark:border-gray-600 focus:border-green-main focus:ring-green-main'}
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
            disabled={isLoading}
          />
          {error && (
            <p className="mt-2 text-sm text-status-error">{error}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            ID do orçamento no Master Data (campo idBudget)
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Buscando versões...' : 'Buscar Versões'}
        </Button>
      </form>
    </Card>
  );
}
