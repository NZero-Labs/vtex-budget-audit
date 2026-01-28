/**
 * Legenda de criticidade - Design System Amara NZero
 */

import { Card } from '@/components/ui/Card';

export function DiffLegend() {
  return (
    <Card title="Legenda">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Níveis de Criticidade */}
        <div>
          <h4 className="font-bold text-[#3c3c3b] dark:text-white mb-4 text-base">
            Níveis de Criticidade
          </h4>
          <div className="space-y-3">
            <LegendItem 
              color="bg-status-error" 
              label="Crítico" 
              description="Divergência que pode impedir fechamento do pedido ou causar grande prejuízo"
            />
            <LegendItem 
              color="bg-brand-yellow" 
              label="Alto" 
              description="Divergência significativa com impacto financeiro considerável"
            />
            <LegendItem 
              color="bg-brand-yellow/60" 
              label="Médio" 
              description="Divergência moderada que requer atenção"
            />
            <LegendItem 
              color="bg-brand-cyan" 
              label="Baixo" 
              description="Divergência menor, sem impacto financeiro significativo"
            />
            <LegendItem 
              color="bg-green-main" 
              label="OK" 
              description="Sem divergência, valores alinhados"
            />
          </div>
        </div>

        {/* Status de Itens */}
        <div>
          <h4 className="font-bold text-[#3c3c3b] dark:text-white mb-4 text-base">
            Status de Itens
          </h4>
          <div className="space-y-3">
            <LegendStatus 
              label="Igual" 
              description="Item idêntico em orçamento e carrinho"
            />
            <LegendStatus 
              label="Qtd Diferente" 
              description="Quantidade do item difere entre orçamento e carrinho"
            />
            <LegendStatus 
              label="Preço Diferente" 
              description="Preço unitário do item difere"
            />
            <LegendStatus 
              label="Falta no Carrinho" 
              description="Item está no orçamento mas não foi adicionado ao carrinho"
            />
            <LegendStatus 
              label="Extra no Carrinho" 
              description="Item no carrinho que não constava no orçamento"
            />
          </div>
        </div>
      </div>

      {/* Nota explicativa */}
      <div className="mt-6 pt-4 border-t border-grey-medium/20">
        <p className="text-sm text-[#575756] dark:text-white/80 leading-relaxed">
          <strong className="text-[#3c3c3b] dark:text-white">Nota:</strong> Os thresholds de criticidade podem ser configurados via variáveis de ambiente.
          Por padrão, diferenças acima de 0.5% ou R$ 50,00 são marcadas como críticas.
        </p>
      </div>
    </Card>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
  description: string;
}

function LegendItem({ color, label, description }: LegendItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className={`w-3 h-3 rounded-full ${color} mt-1.5 flex-shrink-0`} />
      <div className="leading-relaxed">
        <span className="font-semibold text-[#3c3c3b] dark:text-white">{label}:</span>
        <span className="text-[#575756] dark:text-white/80 ml-1">{description}</span>
      </div>
    </div>
  );
}

interface LegendStatusProps {
  label: string;
  description: string;
}

function LegendStatus({ label, description }: LegendStatusProps) {
  return (
    <div className="leading-relaxed">
      <span className="font-semibold text-[#3c3c3b] dark:text-white">{label}:</span>
      <span className="text-[#575756] dark:text-white/80 ml-1">{description}</span>
    </div>
  );
}
