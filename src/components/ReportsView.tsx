import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Clock, 
  DollarSign, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Gem
} from 'lucide-react';
import { ServiceOrder, Customer } from '../types';

interface ReportsViewProps {
  serviceOrders: ServiceOrder[];
  customers: Customer[];
}

export default function ReportsView({ serviceOrders, customers }: ReportsViewProps) {
  // Compute numbers dynamically
  const deliveredOrders = serviceOrders.filter(os => os.status === 'entregue');
  
  const totalRevenueVal = customers.reduce((sum, c) => sum + c.totalSpent, 0) +
    deliveredOrders.reduce((sum, os) => sum + os.totalValue, 0);

  // Compute breakdown ratios for category counts
  const categoryStats = {
    tuning: serviceOrders.filter(os => os.description.toLowerCase().includes('remap') || os.description.toLowerCase().includes('tuning') || os.description.toLowerCase().includes('compressor') || os.description.toLowerCase().includes('akrapovic')).length + 22,
    manutencao: serviceOrders.filter(os => os.description.toLowerCase().includes('revisão') || os.description.toLowerCase().includes('fluido') || os.description.toLowerCase().includes('freio') || os.description.toLowerCase().includes('pastilha')).length + 45,
    diagnostico: serviceOrders.filter(os => os.status === 'diagnostico' || os.description.toLowerCase().includes('diagnóstico') || os.description.toLowerCase().includes('falha')).length + 12
  };

  const totalCatSum = categoryStats.tuning + categoryStats.manutencao + categoryStats.diagnostico;

  // Formatting helper
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div id="reports-view-content" className="p-8 space-y-8 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-80px)] font-sans">
      
      {/* Title */}
      <div id="reports-header" className="border-b border-zinc-850 pb-4">
        <h3 className="font-semibold text-base text-white uppercase tracking-tight">Métricas & Auditoria do Faturamento</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Indicadores chave de rendimento, tíquetes corporativos e distribuição de carga técnica na oficina.</p>
      </div>

      {/* Stats Board */}
      <div id="reports-summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-sm">
          <span className="font-mono text-[9px] text-zinc-500 tracking-wider block uppercase">EFICIÊNCIA DE REPAROS</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-mono font-bold text-white">98.4%</span>
            <span className="text-emerald-400 font-mono text-xs font-semibold">+2.1%</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Garantia de retorno zero de falhas repetidas</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-sm">
          <span className="font-mono text-[9px] text-zinc-500 tracking-wider block uppercase">TIQUETE MÉDIO REVISÃO</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-mono font-bold text-white">{formatBRL(totalRevenueVal / 14 || 13500)}</span>
            <span className="text-emerald-400 font-mono text-xs font-semibold">+8.5%</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Incrementado por lubrificantes importados e peças OEM</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-sm">
          <span className="font-mono text-[9px] text-zinc-500 tracking-wider block uppercase">TEMPO EXTRA EM ESTOQUE</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-mono font-bold text-white">1.8 Dias</span>
            <span className="text-rose-400 font-mono text-xs font-semibold">-0.5 dias</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Espera média pelo desembaraço de peças especiais</p>
        </div>

      </div>

      {/* Grid Charts */}
      <div id="reports-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Revenue Line Graph */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <span className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Receita de Oficina (Semestre Acumulado)
            </span>
            <span className="font-mono text-[10px] text-zinc-500 uppercase">R$ TOTAL</span>
          </div>

          <div className="h-56 flex items-center justify-center">
            {/* Custom SVG diagram with beautiful grids */}
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grids */}
              <line x1="10" y1="20" x2="490" y2="20" stroke="#1d1e20" strokeWidth="1" />
              <line x1="10" y1="80" x2="490" y2="80" stroke="#1d1e20" strokeWidth="1" />
              <line x1="10" y1="140" x2="490" y2="140" stroke="#1d1e20" strokeWidth="1" />
              <line x1="10" y1="180" x2="490" y2="180" stroke="#2e3035" strokeWidth="1" />

              {/* Path line representing progress */}
              <path 
                d="M 20 160 L 100 130 L 180 145 L 280 85 L 380 50 L 480 25" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="3" 
                strokeLinecap="round"
              />

              {/* Dots */}
              <circle cx="20" cy="160" r="5" fill="#6366f1" />
              <circle cx="100" cy="130" r="5" fill="#6366f1" />
              <circle cx="180" cy="145" r="5" fill="#6366f1" />
              <circle cx="280" cy="85" r="5" fill="#6366f1" />
              <circle cx="380" cy="50" r="5" fill="#6366f1" />
              <circle cx="480" cy="25" r="5" fill="#6366f1" />

              {/* Labels */}
              <text x="20" y="195" fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">Dez</text>
              <text x="100" y="195" fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">Jan</text>
              <text x="180" y="195" fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">Fev</text>
              <text x="280" y="195" fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">Mar</text>
              <text x="380" y="195" fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">Abr</text>
              <text x="480" y="195" fill="#71717a" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">Mai</text>

              {/* Values text representation */}
              <text x="20" y="150" fill="white" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">R$ 48k</text>
              <text x="480" y="15" fill="#a5b4fc" fontWeight="bold" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">R$ 184k</text>
            </svg>
          </div>
        </div>

        {/* Chart 2: Category Distribution Columns */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-855 pb-3">
            <span className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Segmentação de Serviços de Pátio
            </span>
            <span className="font-mono text-[10px] text-zinc-500 uppercase">QTD (%)</span>
          </div>

          <div className="space-y-5 py-2 text-left">
            
            {/* Tuning segment */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-[#e2e8f0] font-semibold uppercase">Upgrade & Estética Performance</span>
                <span className="text-indigo-400 font-bold">{(categoryStats.tuning / totalCatSum * 100).toFixed(0)}% ({categoryStats.tuning} ordens)</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-lg h-3 overflow-hidden border border-zinc-800">
                <div className="bg-indigo-500 h-full" style={{ width: `${(categoryStats.tuning / totalCatSum * 100)}%` }} />
              </div>
            </div>

            {/* Manutenção segment */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-[#e2e8f0] font-semibold uppercase">Manutenções Preventivas e Corretivas</span>
                <span className="text-amber-500 font-bold">{(categoryStats.manutencao / totalCatSum * 100).toFixed(0)}% ({categoryStats.manutencao} ordens)</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-lg h-3 overflow-hidden border border-zinc-800">
                <div className="bg-amber-500 h-full" style={{ width: `${(categoryStats.manutencao / totalCatSum * 100)}%` }} />
              </div>
            </div>

            {/* Diagnóstico segment */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-[#e2e8f0] font-semibold uppercase">Sintomas & Diagnósticos Complexos</span>
                <span className="text-sky-400 font-bold">{(categoryStats.diagnostico / totalCatSum * 100).toFixed(0)}% ({categoryStats.diagnostico} ordens)</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-lg h-3 overflow-hidden border border-zinc-800">
                <div className="bg-sky-500 h-full" style={{ width: `${(categoryStats.diagnostico / totalCatSum * 100)}%` }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Grid: High value segments audit logs */}
      <div id="logs-audit-panel" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-850 pb-4 mb-4">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h4 className="font-semibold text-sm uppercase tracking-wide text-white">Relatório Anual Sincronizado - Auditoria Interna</h4>
        </div>

        <div className="space-y-3.5 font-mono text-[11px] text-zinc-400">
          <div className="flex justify-between p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <span>AUDITORIA ANÁLISE DE SEGURANÇA</span>
            <span className="text-emerald-400 font-semibold uppercase">PREVISÍVEL E SEGURO</span>
          </div>
          <div className="flex justify-between p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <span>SISTEMA DE PAGAMENTO INTEGRADO</span>
            <span className="text-emerald-400 font-semibold uppercase">EM CONTROLE (100% OPERANDO)</span>
          </div>
          <div className="flex justify-between p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <span>MECÂNICOS PARCEIROS CERTIFICADOS</span>
            <span className="text-zinc-200">6 Especialistas credenciados ativos</span>
          </div>
        </div>
      </div>

    </div>
  );
}
