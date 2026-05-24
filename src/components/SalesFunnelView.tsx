import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  Phone,
  Mail,
  Loader2,
  Check,
  Plus,
  X,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Lead, Customer, FunnelStage } from '../types';

interface SalesFunnelViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onApproveLeadToServiceOrder: (lead: Lead) => void;
  funnelStages?: FunnelStage[];
  setFunnelStages?: React.Dispatch<React.SetStateAction<FunnelStage[]>>;
}

export default function SalesFunnelView({
  leads,
  setLeads,
  customers,
  setCustomers,
  onApproveLeadToServiceOrder,
  funnelStages = [],
  setFunnelStages
}: SalesFunnelViewProps) {
  // States for diagnostic loader and modal view
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Funnel stage manager local states
  const [showStageManager, setShowStageManager] = useState(false);
  const [editingStages, setEditingStages] = useState<FunnelStage[]>([]);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#6366f1');
  const [stageManagerError, setStageManagerError] = useState<string | null>(null);

  const STAGE_COLORS = ['#818cf8', '#6366f1', '#a5b4fc', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#64748b'];

  // Form states for rapid inline addition inside column
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: 2020,
    vehiclePlate: '',
    description: '',
    category: 'Diagnóstico' as Lead['category'],
    value: '' as number | '',
    priority: 'NORMAL' as Lead['priority'],
  });

  // Target columns corresponding to stages (falls back to defaults if not populated)
  const columns = funnelStages && funnelStages.length > 0 ? funnelStages : [
    { id: 'leads', title: 'Novo Lead', color: '#818cf8' },
    { id: 'quotes', title: 'Orçamento Enviado', color: '#6366f1' },
    { id: 'negotiation', title: 'Negociação', color: '#a5b4fc' },
    { id: 'approved', title: 'Serviço Aprovado', color: '#10b981' }
  ];

  // Helper BRL currency formatter
  const formatBRL = (value: number | '') => {
    if (value === '' || isNaN(value)) return 'A definir';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Helper to relocate leads between stages with precise button bounds
  const moveLead = (leadId: string, direction: 'prev' | 'next') => {
    const stages = columns.map(col => col.id);
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id !== leadId) return lead;
      const currentIndex = stages.indexOf(lead.stage);
      let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= stages.length) nextIndex = stages.length - 1;

      // When lead is moved to "approved", trigger OS creation
      const updatedLead = { ...lead, stage: stages[nextIndex] };
      if (stages[nextIndex] === 'approved' && lead.stage !== 'approved') {
        setTimeout(() => {
          onApproveLeadToServiceOrder(updatedLead);
        }, 150);
      }
      return updatedLead;
    }));
  };

  const deleteLead = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeads(prev => prev.filter(l => l.id !== leadId));
    if (selectedLead?.id === leadId) setSelectedLead(null);
    setFeedbackMsg("Oportunidade removida com sucesso do funil de vendas.");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Stage editing operations inside manager
  const handleOpenStageManager = () => {
    setEditingStages([...columns]);
    setStageManagerError(null);
    setShowStageManager(true);
  };

  const moveStageOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editingStages.length) return;
    const reordered = [...editingStages];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setEditingStages(reordered);
  };

  const handleUpdateStageName = (index: number, title: string) => {
    setEditingStages(prev => prev.map((item, idx) => idx === index ? { ...item, title } : item));
  };

  const handleUpdateStageColor = (index: number, color: string) => {
    setEditingStages(prev => prev.map((item, idx) => idx === index ? { ...item, color } : item));
  };

  const handleDeleteStageFromEditing = (index: number) => {
    const stageId = editingStages[index].id;
    const leadsCount = leads.filter(l => l.stage === stageId).length;
    if (leadsCount > 0) {
      setStageManagerError(`Erro: Existem ${leadsCount} leads nesta etapa. Remova ou mova-os para outra coluna antes de excluir.`);
      setTimeout(() => setStageManagerError(null), 6000);
      return;
    }
    if (editingStages.length <= 1) {
      setStageManagerError("Erro: O funil de vendas precisa possuir pelo menos 1 etapa.");
      setTimeout(() => setStageManagerError(null), 4000);
      return;
    }
    setEditingStages(prev => prev.filter((_, idx) => idx !== index));
    setStageManagerError(null);
  };

  const handleAddNewStage = () => {
    if (!newStageName.trim()) {
      setStageManagerError("Digite o nome da nova etapa.");
      setTimeout(() => setStageManagerError(null), 3000);
      return;
    }
    const cleanId = 'stage_' + Date.now().toString().slice(-4) + '_' + Math.floor(Math.random() * 100);
    const newStage: FunnelStage = {
      id: cleanId,
      title: newStageName.trim(),
      color: newStageColor
    };
    setEditingStages(prev => [...prev, newStage]);
    setNewStageName('');
    setStageManagerError(null);
  };

  const handleSaveStages = () => {
    if (setFunnelStages) {
      setFunnelStages(editingStages);
      setFeedbackMsg("Etapas do funil atualizadas com sucesso!");
      setTimeout(() => setFeedbackMsg(null), 3500);
      setShowStageManager(false);
    }
  };

  // Add new lead directly to specific column
  const handleCreateLeadInline = () => {
    if (!newLeadForm.name || !newLeadForm.vehicleModel) {
      setFeedbackMsg("Erro: Digite o nome do cliente e modelo do veículo.");
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }

    const uniqueId = `LEAD-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const freshLead: Lead = {
      id: uniqueId,
      name: newLeadForm.name,
      email: newLeadForm.email || `${newLeadForm.name.toLowerCase().replace(/\s/g, '')}@email.com`,
      phone: newLeadForm.phone || '+55 11 99999-8888',
      vehicleBrand: newLeadForm.vehicleBrand || 'Veículo',
      vehicleModel: newLeadForm.vehicleModel,
      vehicleYear: newLeadForm.vehicleYear,
      vehiclePlate: newLeadForm.vehiclePlate.toUpperCase() || 'DEF-1234',
      description: newLeadForm.description || 'Nenhum sintoma adicional informado.',
      category: newLeadForm.category,
      value: newLeadForm.value,
      priority: newLeadForm.priority,
      stage: addingToColumn || (columns[0]?.id || 'leads'),
      dateCreated: 'Agora mesmo'
    };

    setLeads(prev => [freshLead, ...prev]);
    setAddingToColumn(null);
    setFeedbackMsg(`Sucesso! Lead "${freshLead.name}" adicionado.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
    setNewLeadForm({
      name: '',
      email: '',
      phone: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: 2022,
      vehiclePlate: '',
      description: '',
      category: 'Diagnóstico',
      value: '',
      priority: 'NORMAL',
    });
  };

  // Manual save for single leads
  const handleSaveLeadEdits = () => {
    if (!selectedLead) return;
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? selectedLead : l));
    setIsEditing(false);
    setFeedbackMsg("Informações da oportunidade salvas com sucesso!");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div id="sales-funnel-view" className="p-8 space-y-6 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-80px)] font-sans">
      
      {/* Funnel header block */}
      <div id="funnel-instructions-panel" className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-white">Funil de Vendas e Oportunidades</h3>
          <p className="text-xs text-zinc-400 mt-0.5 animate-fade-in">Gerencie os leads da sua oficina, acompanhe propostas de orçamento e avance as negociações até a aprovação.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleOpenStageManager}
            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 font-mono text-[11px] font-bold py-2 px-3.5 rounded-lg text-white uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-inner"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" /> Etapas do Funil
          </button>
          <button
            onClick={() => setAddingToColumn(columns[0]?.id || 'leads')}
            className="bg-indigo-600 hover:bg-indigo-700 font-mono text-[11px] font-bold py-2 px-3.5 rounded-lg text-white uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Novo Lead
          </button>
        </div>
      </div>

      {/* Grid columns */}
      <div id="kanban-grid" className="flex gap-6 items-start overflow-x-auto pb-4 max-w-full">
        {columns.map((column) => {
          const colLeads = leads.filter(l => l.stage === column.id);

          return (
            <div 
              key={column.id} 
              id={`kanban-col-${column.id}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col max-h-[85vh] shadow-sm w-[300px] shrink-0"
            >
              {/* Header column */}
              <div className="flex justify-between items-center pb-3 border-b border-zinc-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-white truncate max-w-[180px]">{column.title}</h4>
                </div>
                <span className="font-mono text-[11px] bg-zinc-950 px-2.5 py-0.5 rounded-md text-zinc-400 font-bold">
                  {colLeads.length}
                </span>
              </div>

              {/* Add form inside column toggle */}
              {addingToColumn === column.id && (
                <div id="inline-insert-form" className="bg-zinc-950 border border-indigo-500/30 p-4 rounded-xl mb-4 space-y-3 shadow-inner text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase font-bold text-indigo-400">Cadastro Rápido</span>
                    <button onClick={() => setAddingToColumn(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {customers && customers.length > 0 && (
                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[9px] text-zinc-550 uppercase block pl-0.5">Vincular Cliente (Opcional)</label>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const found = customers.find(c => c.id === val);
                            if (found) {
                              setNewLeadForm(prev => ({
                                ...prev,
                                name: found.name,
                                email: found.email || '',
                                phone: found.phone || '',
                                vehicleBrand: found.vehicleBrand || '',
                                vehicleModel: found.vehicleModel || '',
                                vehicleYear: found.vehicleYear || 2022,
                                vehiclePlate: found.vehiclePlate || '',
                              }));
                            }
                          }
                        }}
                        defaultValue=""
                        className="w-full bg-[#111415] border border-zinc-850 text-zinc-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 font-sans cursor-pointer"
                      >
                        <option value="">-- Selecione um Cliente da Base --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#111415]">
                            {c.name} ({c.vehicleBrand} {c.vehicleModel})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <input
                    type="text"
                    placeholder="Nome do Cliente *"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full bg-[#111415] border border-zinc-855 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Marca (ex: BMW)"
                      value={newLeadForm.vehicleBrand}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, vehicleBrand: e.target.value })}
                      className="bg-[#111415] border border-zinc-855 rounded px-2 py-1.5 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Modelo *"
                      value={newLeadForm.vehicleModel}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, vehicleModel: e.target.value })}
                      className="bg-[#111415] border border-zinc-855 rounded px-2 py-1.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Placa carro"
                      value={newLeadForm.vehiclePlate}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, vehiclePlate: e.target.value })}
                      className="bg-[#111415] border border-zinc-855 rounded px-2 py-1.5 text-xs text-white outline-none uppercase"
                    />
                    <input
                      type="number"
                      placeholder="Preço R$ (Opcional)"
                      value={newLeadForm.value}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, value: e.target.value !== '' ? parseFloat(e.target.value) : '' })}
                      className="bg-[#111415] border border-zinc-855 rounded px-2 py-1.5 text-xs text-white outline-none"
                    />
                  </div>

                  <textarea
                    placeholder="Descrição dos sintomas ou queixas..."
                    value={newLeadForm.description}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, description: e.target.value })}
                    className="w-full h-16 bg-[#111415] border border-zinc-855 rounded px-2 py-1.5 text-xs text-white outline-none resize-none font-sans"
                  />

                  <div className="flex gap-2">
                    <select
                      value={newLeadForm.priority}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as Lead['priority'] })}
                      className="w-1/2 bg-[#111415] border border-zinc-855 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="ALTA">ALTA</option>
                      <option value="URGENTE">URGENTE</option>
                    </select>

                    <select
                      value={newLeadForm.category}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, category: e.target.value as Lead['category'] })}
                      className="w-1/2 bg-[#111415] border border-zinc-855 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Diagnóstico">Diagnóstico</option>
                      <option value="Tuning">Tuning</option>
                      <option value="Revisão">Revisão</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Upgrade">Upgrade</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCreateLeadInline}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold py-2 text-xs rounded uppercase tracking-wider transition-all cursor-pointer shadow"
                  >
                    Gravar Oportunidade
                  </button>
                </div>
              )}

              {/* Column lead cards stack */}
              <div id={`kanban-cards-${column.id}`} className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-[45vh]">
                {colLeads.map((lead) => {
                  const isUrg = lead.priority === 'URGENTE';

                  return (
                    <div
                      key={lead.id}
                      id={`lead-card-${lead.id}`}
                      onClick={() => { setSelectedLead(lead); setIsEditing(false); }}
                      className={`cursor-pointer bg-zinc-950 hover:bg-zinc-850 rounded-xl p-4 border transition-all text-left relative shadow-inner ${
                        isUrg ? 'border-l-4 border-l-rose-500 border-zinc-800' : 'border-zinc-800'
                      }`}
                    >
                      {/* Priority Warning Header */}
                      <div className="flex justify-between items-start">
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isUrg ? 'bg-rose-500/25 text-rose-400' :
                          lead.priority === 'ALTA' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-zinc-850 text-zinc-400'
                        }`}>
                          {lead.priority}
                        </span>

                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          {/* Chevron navigations for direct shifting */}
                          <button
                            title="Mover para esquerda"
                            onClick={() => moveLead(lead.id, 'prev')}
                            className="p-1 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Mover para direita"
                            onClick={() => moveLead(lead.id, 'next')}
                            className="p-1 hover:bg-zinc-900 rounded text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Excluir Oportunidade"
                            onClick={(e) => deleteLead(lead.id, e)}
                            className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Client Name */}
                      <h5 id={`lead-name-${lead.id}`} className="font-bold text-white mt-2 leading-snug">{lead.name}</h5>
                      <p id={`lead-vehicle-${lead.id}`} className="font-mono text-[11px] text-zinc-400 mt-1">
                        {lead.vehicleBrand} {lead.vehicleModel} - <span className="text-white/60">{lead.vehiclePlate || 'S/P'}</span>
                      </p>

                      {/* Complaint symptom description */}
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 h-8 leading-snug font-sans">
                        {lead.description}
                      </p>

                      {/* Card Divider */}
                      <div className="w-full h-px bg-zinc-900 my-3" />

                      {/* Footer Badge values */}
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded font-semibold uppercase">
                          {lead.category}
                        </span>
                        
                        <span className="font-mono text-xs font-bold text-white">
                          {formatBRL(lead.value)}
                        </span>
                      </div>

                      {/* Card Creation Date */}
                      <div className="mt-3.5 pt-2 border-t border-zinc-900 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">{lead.dateCreated}</span>
                        <span className="font-mono text-[8px] text-zinc-650">AÇÕES INDIVIDUAIS</span>
                      </div>
                    </div>
                  );
                })}

                {colLeads.length === 0 && (
                  <div className="border border-dashed border-zinc-800 rounded-xl py-10 px-4 text-center text-zinc-500 text-xs">
                    Vazia. Clique no "+" ou botão superior para criar.
                  </div>
                )}
              </div>
              
              {/* Bottom quick adder trigger inside col */}
              <button
                onClick={() => setAddingToColumn(column.id)}
                className="w-full mt-3.5 border border-dashed border-zinc-800 hover:border-indigo-500/40 hover:bg-[#111415]/30 text-zinc-500 hover:text-white/90 py-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> ADICIONAR CARD
              </button>
            </div>
          );
        })}
      </div>

      {/* STAGE MANAGER MODAL */}
      {showStageManager && (
        <div id="stage-manager-modal" className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 text-left space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <h4 className="font-semibold text-base text-white uppercase tracking-tight">Etapas do Funil de Vendas</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Adicione Novas Etapas, ordene sua sequência ou edite os nomes de cada coluna.</p>
              </div>
              <button 
                onClick={() => setShowStageManager(false)}
                className="w-8 h-8 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error notifications inside modal */}
            {stageManagerError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-550 p-2.5 rounded-lg text-[11px] leading-relaxed font-mono flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
                <span>{stageManagerError}</span>
              </div>
            )}

            {/* Dynamic Stage List */}
            <div className="space-y-3.5 max-h-[45vh] overflow-y-auto pr-1">
              {editingStages.map((stage, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === editingStages.length - 1;

                return (
                  <div key={stage.id} className="bg-zinc-950 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                    {/* Position arrows */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        title="Mover para cima"
                        disabled={isFirst}
                        onClick={() => moveStageOrder(idx, 'up')}
                        className={`p-1 rounded transition-all hover:bg-zinc-900 ${isFirst ? 'text-zinc-800 cursor-not-allowed opacity-20' : 'text-zinc-400 hover:text-white'}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        title="Mover para baixo"
                        disabled={isLast}
                        onClick={() => moveStageOrder(idx, 'down')}
                        className={`p-1 rounded transition-all hover:bg-zinc-900 ${isLast ? 'text-zinc-800 cursor-not-allowed opacity-20' : 'text-zinc-400 hover:text-white'}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stage Name Editing Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={stage.title}
                        onChange={(e) => handleUpdateStageName(idx, e.target.value)}
                        className="w-full bg-[#111415] border border-zinc-850 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500 font-sans font-semibold"
                        placeholder="Nome da Etapa"
                      />
                    </div>

                    {/* Color selection dots */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex gap-1 overflow-x-auto p-1 bg-[#111415] rounded-md border border-zinc-850">
                        {STAGE_COLORS.slice(0, 5).map(c => (
                          <button
                            key={c}
                            onClick={() => handleUpdateStageColor(idx, c)}
                            className={`w-3 h-3 rounded-full border transition-all ${stage.color === c ? 'scale-110 border-white' : 'border-transparent scale-100 hover:scale-[1.05]'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Delete action button */}
                    <button
                      title="Excluir Etapa"
                      onClick={() => handleDeleteStageFromEditing(idx)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-500/10 border border-zinc-850 hover:border-rose-450 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick adding block */}
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3">
              <span className="font-mono text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">Criar Nova Etapa</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Nome (Ex: Pós-Venda)"
                  className="bg-[#111415] border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-sans"
                />
                
                {/* Choose color for new stage */}
                <div className="flex items-center gap-1.5 bg-[#111415] border border-zinc-850 rounded-lg px-2 py-1 select-none">
                  <span className="font-mono text-[9px] text-zinc-550 shrink-0">COR:</span>
                  <div className="flex gap-1 overflow-x-auto py-0.5 justify-start">
                    {STAGE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewStageColor(c)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all shrink-0 ${newStageColor === c ? 'scale-110 border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddNewStage}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-mono font-bold py-2.5 text-xs rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Cadastrar Etapa
              </button>
            </div>

            {/* Support disclaimer alert */}
            <div className="bg-indigo-950/15 border border-indigo-800/20 text-indigo-400 p-3 rounded-lg text-[10px] leading-relaxed font-sans">
              <p className="font-bold uppercase tracking-wider mb-0.5">Nota de Integração Backend:</p>
              Se você possui um banco no Supabase conectado, execute o SQL <code className="bg-zinc-950 px-1 py-0.5 rounded text-white font-mono">ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_stage_check;</code> para liberar etapas ilimitadas.
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowStageManager(false)}
                className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveStages}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold text-xs py-2 px-5 rounded-lg uppercase tracking-wider cursor-pointer shadow-md"
              >
                Salvar Configuração
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LEAD DETAILS & DETAILS MODAL */}
      {selectedLead && (
        <div id="lead-details-modal" className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 text-left space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <span className="font-mono text-[9px] text-white bg-indigo-600 px-2.5 py-0.5 rounded font-bold uppercase">{selectedLead.priority}</span>
                <h4 className="font-semibold text-lg text-white mt-1.5 uppercase tracking-tight">{selectedLead.name}</h4>
                <p className="font-mono text-xs text-zinc-500 mt-1">Código ID Oportunidade: {selectedLead.id}</p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Editing and detail switch */}
            {isEditing ? (
              <div className="space-y-4 text-left">
                <div id="editing-fields-form" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">Cliente</label>
                    <input 
                      type="text" 
                      value={selectedLead.name}
                      onChange={e => setSelectedLead({ ...selectedLead, name: e.target.value })}
                      className="w-full bg-[#111415] border border-zinc-800 text-[#e1e3e4] rounded px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">E-mail</label>
                    <input 
                      type="email" 
                      value={selectedLead.email}
                      onChange={e => setSelectedLead({ ...selectedLead, email: e.target.value })}
                      className="w-full bg-[#111415] border border-zinc-800 text-[#e1e3e4] rounded px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">Telefone</label>
                    <input 
                      type="text" 
                      value={selectedLead.phone}
                      onChange={e => setSelectedLead({ ...selectedLead, phone: e.target.value })}
                      className="w-full bg-[#111415] border border-zinc-800 text-[#e1e3e4] rounded px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">Carro Modelo</label>
                    <input 
                      type="text" 
                      value={selectedLead.vehicleModel}
                      onChange={e => setSelectedLead({ ...selectedLead, vehicleModel: e.target.value })}
                      className="w-full bg-[#111415] border border-zinc-800 text-[#e1e3e4] rounded px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-400 uppercase">Orçamento (R$)</label>
                    <input 
                      type="number" 
                      value={selectedLead.value}
                      onChange={e => setSelectedLead({ ...selectedLead, value: e.target.value !== '' ? parseFloat(e.target.value) : '' })}
                      className="w-full bg-[#111415] border border-zinc-800 text-[#e1e3e4] rounded px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[10px] text-zinc-400 uppercase">Reclamação ou Sintomas Detalhados (Notas)</label>
                  <textarea 
                    rows={4}
                    value={selectedLead.description}
                    onChange={e => setSelectedLead({ ...selectedLead, description: e.target.value })}
                    className="w-full bg-[#111415] border border-zinc-800 text-[#e1e3e4] rounded p-3 text-xs outline-none resize-none font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-800 justify-end">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="border border-zinc-800 text-white font-mono text-xs py-2 px-4 rounded-lg hover:border-zinc-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveLeadEdits}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold text-xs py-2 px-5 rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visual spec checklist card */}
                <div id="modal-spec-checklist" className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                  <div>
                    <span className="font-mono text-[9px] text-zinc-500 block uppercase">VEÍCULO</span>
                    <span className="text-xs font-bold text-white block mt-0.5">{selectedLead.vehicleBrand} {selectedLead.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-zinc-550 block uppercase">PLACA</span>
                    <span className="font-mono text-xs font-bold text-indigo-400 block mt-0.5">{selectedLead.vehiclePlate || 'NÃO ATRIBUÍDA'}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-zinc-550 block uppercase">ORÇAMENTO</span>
                    <span className="font-mono text-xs font-bold text-white block mt-0.5">{formatBRL(selectedLead.value)}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-zinc-550 block uppercase">SERVIÇO CATEGORIA</span>
                    <span className="font-mono text-xs font-bold text-indigo-400 block mt-0.5 uppercase">{selectedLead.category}</span>
                  </div>
                </div>

                {/* Patient / customer details contact panel */}
                <div id="modal-customer-contact" className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedLead.email}</span>
                  </div>
                </div>

                {/* Core description details */}
                <div id="defect-disclaimer" className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white border-b border-zinc-800 pb-2">CONDIÇÃO INFORMADA PELO CLIENTE</h4>
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-xs leading-relaxed text-zinc-300 text-left">
                    {selectedLead.description}
                  </div>
                </div>

                {/* Bottom action controls */}
                <div id="details-modal-controls" className="flex justify-between pt-6 border-t border-zinc-800">
                  <button
                    onClick={(e) => deleteLead(selectedLead.id, e)}
                    className="border border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500 font-mono text-xs font-bold py-2 px-3 rounded-lg uppercase text-rose-450 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Oportunidade
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="border border-zinc-800 hover:border-indigo-500 text-white font-mono text-xs py-2 px-5 rounded-lg uppercase tracking-wide transition-all cursor-pointer"
                    >
                      Editar Dados
                    </button>
                    {columns.findIndex(col => col.id === selectedLead.stage) < columns.length - 1 && (
                      <button
                        onClick={() => {
                          moveLead(selectedLead.id, 'next');
                          setSelectedLead(null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs py-2 px-5 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Avançar Pipeline
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 border-l-4 border-indigo-500 border-zinc-800 rounded-xl p-4 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{feedbackMsg}</span>
        </div>
      )}

    </div>
  );
}
