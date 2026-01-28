'use client';

/**
 * Formulário de entrada - Design System Amara NZero
 */

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface InputFormProps {
  onSubmit: (data: { orderFormUrl: string; idBudget: string }) => void;
  isLoading: boolean;
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [orderFormUrl, setOrderFormUrl] = useState('');
  const [idBudget, setIdBudget] = useState('');
  const [errors, setErrors] = useState<{ orderFormUrl?: string; idBudget?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!orderFormUrl.trim()) {
      newErrors.orderFormUrl = 'URL do carrinho é obrigatória';
    }

    if (!idBudget.trim()) {
      newErrors.idBudget = 'ID do orçamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ orderFormUrl: orderFormUrl.trim(), idBudget: idBudget.trim() });
    }
  };

  return (
    <Card title="Dados para Comparação" subtitle="Informe a URL do carrinho VTEX e o ID do orçamento">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL do Carrinho */}
        <div>
          <label 
            htmlFor="orderFormUrl" 
            className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
          >
            URL do Carrinho / OrderFormId
          </label>
          <input
            type="text"
            id="orderFormUrl"
            value={orderFormUrl}
            onChange={(e) => setOrderFormUrl(e.target.value)}
            placeholder="https://www.loja.com.br/checkout/?orderFormId=abc123 ou abc123"
            className={`
              w-full px-4 py-3 rounded-md border text-base transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-green-main
              ${errors.orderFormUrl 
                ? 'border-status-error focus:ring-status-error' 
                : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          {errors.orderFormUrl && (
            <p className="mt-2 text-sm font-medium text-status-error">{errors.orderFormUrl}</p>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Cole a URL completa do checkout ou apenas o orderFormId
          </p>
        </div>

        {/* ID do Orçamento */}
        <div>
          <label 
            htmlFor="idBudget" 
            className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
          >
            ID do Orçamento
          </label>
          <input
            type="text"
            id="idBudget"
            value={idBudget}
            onChange={(e) => setIdBudget(e.target.value)}
            placeholder="12345"
            className={`
              w-full px-4 py-3 rounded-md border text-base transition-colors
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-green-main
              ${errors.idBudget 
                ? 'border-status-error focus:ring-status-error' 
                : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          {errors.idBudget && (
            <p className="mt-2 text-sm font-medium text-status-error">{errors.idBudget}</p>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            ID do orçamento armazenado no Master Data
          </p>
        </div>

        {/* Botão Submit */}
        <div className="pt-4">
          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Comparando...' : 'Comparar'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
