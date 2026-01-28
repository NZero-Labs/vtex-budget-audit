/**
 * Componente Card - Design System Amara NZero
 */

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-card border border-gray-200 dark:border-gray-700 transition-colors ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}
