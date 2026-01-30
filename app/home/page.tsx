'use client';

/**
 * Página Home - Seleção de tipo de comparação
 * Design System Amara NZero
 */

import Link from 'next/link';

/**
 * Card de seleção para tipo de comparação
 */
interface SelectionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accentColor: 'green' | 'cyan';
}

function SelectionCard({ title, description, href, icon, accentColor }: SelectionCardProps) {
  const accentStyles = {
    green: {
      border: 'hover:border-green-main',
      iconBg: 'bg-green-main/10',
      iconColor: 'text-green-main',
      button: 'bg-green-main hover:bg-green-light',
    },
    cyan: {
      border: 'hover:border-brand-cyan',
      iconBg: 'bg-brand-cyan/10',
      iconColor: 'text-brand-cyan',
      button: 'bg-brand-cyan hover:bg-brand-cyan/80',
    },
  };

  const styles = accentStyles[accentColor];

  return (
    <Link href={href} className="block group">
      <div className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-card 
        border-2 border-gray-200 dark:border-gray-700 
        transition-all duration-300 
        ${styles.border}
        hover:shadow-lg hover:-translate-y-1
        p-8
      `}>
        {/* Ícone */}
        <div className={`
          w-16 h-16 rounded-xl ${styles.iconBg} 
          flex items-center justify-center mb-6
        `}>
          <div className={styles.iconColor}>
            {icon}
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>

        {/* Descrição */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Botão */}
        <div className={`
          inline-flex items-center px-4 py-2 rounded-lg
          ${styles.button} text-white font-medium
          transition-colors duration-200
          group-hover:gap-3
        `}>
          <span>Acessar</span>
          <svg 
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/**
 * Ícone de carrinho de compras
 */
function CartIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

/**
 * Ícone de documento/orçamento
 */
function DocumentIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

/**
 * Ícone de balança/comparação
 */
function ScaleIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Auditoria de Orçamentos
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Selecione o tipo de comparação que deseja realizar para identificar divergências 
          e garantir a consistência dos valores.
        </p>
      </div>

      {/* Cards de seleção */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Orçamento vs Carrinho */}
        <SelectionCard
          title="Orçamento vs Carrinho"
          description="Compare um orçamento do Master Data com um carrinho ativo (OrderForm) da VTEX para verificar se os valores estão alinhados."
          href="/compare"
          icon={<CartIcon />}
          accentColor="green"
        />

        {/* Orçamento vs Orçamento */}
        <SelectionCard
          title="Orçamento vs Orçamento"
          description="Compare dois orçamentos para identificar diferenças de preços, quantidades e peso. Entenda qual é mais caro e por quê."
          href="/compare-budgets"
          icon={<ScaleIcon />}
          accentColor="cyan"
        />
      </div>

      {/* Info adicional */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-status-info/10 rounded-lg">
            <svg className="w-6 h-6 text-status-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Dica
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A comparação Orçamento vs Orçamento agora inclui informações de peso dos itens, 
              permitindo análises mais completas para cálculos de frete e logística.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
