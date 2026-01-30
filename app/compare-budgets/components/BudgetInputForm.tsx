'use client';

/**
 * Formulário de entrada para comparação Budget vs Budget
 * Design System Amara NZero
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BudgetInputFormProps {
  onSubmit: (data: { idBudget1: string; idBudget2: string }) => void;
  isLoading?: boolean;
}

export function BudgetInputForm({ onSubmit, isLoading = false }: BudgetInputFormProps) {
  const [idBudget1, setIdBudget1] = useState('');
  const [idBudget2, setIdBudget2] = useState('');
  const [errors, setErrors] = useState<{ idBudget1?: string; idBudget2?: string }>({});

  const validate = () => {
    const newErrors: { idBudget1?: string; idBudget2?: string } = {};

    if (!idBudget1.trim()) {
      newErrors.idBudget1 = 'ID do Orçamento 1 é obrigatório';
    }

    if (!idBudget2.trim()) {
      newErrors.idBudget2 = 'ID do Orçamento 2 é obrigatório';
    }

    if (idBudget1.trim() && idBudget2.trim() && idBudget1.trim() === idBudget2.trim()) {
      newErrors.idBudget2 = 'Os IDs dos orçamentos devem ser diferentes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        idBudget1: idBudget1.trim(),
        idBudget2: idBudget2.trim(),
      });
    }
  };

  return (
    <Card title="Dados para Comparação" subtitle="Informe os IDs dos dois orçamentos que deseja comparar">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Orçamento 1 */}
        <div>
          <label 
            htmlFor="idBudget1" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            ID do Orçamento 1
          </label>
          <input
            type="text"
            id="idBudget1"
            value={idBudget1}
            onChange={(e) => setIdBudget1(e.target.value)}
            placeholder="Ex: 12345"
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors
              ${errors.idBudget1 
                ? 'border-status-error focus:border-status-error focus:ring-status-error' 
                : 'border-gray-300 dark:border-gray-600 focus:border-green-main focus:ring-green-main'}
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
            disabled={isLoading}
          />
          {errors.idBudget1 && (
            <p className="mt-2 text-sm text-status-error">{errors.idBudget1}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            ID do documento no Master Data (campo idBudget)
          </p>
        </div>

        {/* Orçamento 2 */}
        <div>
          <label 
            htmlFor="idBudget2" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            ID do Orçamento 2
          </label>
          <input
            type="text"
            id="idBudget2"
            value={idBudget2}
            onChange={(e) => setIdBudget2(e.target.value)}
            placeholder="Ex: 67890"
            className={`
              w-full px-4 py-3 rounded-lg border transition-colors
              ${errors.idBudget2 
                ? 'border-status-error focus:border-status-error focus:ring-status-error' 
                : 'border-gray-300 dark:border-gray-600 focus:border-green-main focus:ring-green-main'}
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
            disabled={isLoading}
          />
          {errors.idBudget2 && (
            <p className="mt-2 text-sm text-status-error">{errors.idBudget2}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            ID do segundo orçamento para comparação
          </p>
        </div>

        {/* Botão de submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Comparando...' : 'Comparar Orçamentos'}
        </Button>
      </form>
    </Card>
  );
}
