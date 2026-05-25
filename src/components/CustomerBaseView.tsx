import React, { useState } from 'react';
import { 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  X,
  CreditCard,
  UserCheck,
  Trash2,
  Layers,
  Wrench
} from 'lucide-react';
import { Customer, Lead, FunnelStage } from '../types';

interface CustomerBaseViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  searchQuery: string;
  brandsList: string[];
  setBrandsList: React.Dispatch<React.SetStateAction<string[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  funnelStages?: FunnelStage[];
  onNewOrderClick?: (id: string) => void;
}

export default function CustomerBaseView({
  customers,
  setCustomers,
  searchQuery,
  brandsList,
  setBrandsList,
  leads,
  setLeads,
  funnelStages,
  onNewOrderClick
}: CustomerBaseViewProps) {
  // Navigation & Filtering States
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'VALOR' | 'RECENTE' | 'INATIVO'>('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Deletion state
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Addition to funnel modal state
  const [customerForFunnel, setCustomerForFunnel] = useState<Customer | null>(null);
  const [funnelForm, setFunnelForm] = useState({
    description: '',
    category: 'Diagnóstico' as Lead['category'],
    value: '' as number | '',
    priority: 'NORMAL' as Lead['priority'],
    stage: 'leads' as Lead['stage'],
  });
  const [funnelFeedback, setFunnelFeedback] = useState<string | null>(null);

  const handleAddToFunnelSubmit = () => {
    if (!customerForFunnel) return;
    const uniqueId = `LEAD-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const newLead: Lead = {
      id: uniqueId,
      name: customerForFunnel.name,
      email: customerForFunnel.email || `${customerForFunnel.name.toLowerCase().replace(/\s/g, '')}@email.com`,
      phone: customerForFunnel.phone || '+55 11 99999-8888',
      vehicleBrand: customerForFunnel.vehicleBrand || 'Veículo',
      vehicleModel: customerForFunnel.vehicleModel || 'Modelo',
      vehicleYear: customerForFunnel.vehicleYear || 2022,
      vehiclePlate: customerForFunnel.vehiclePlate?.toUpperCase() || 'DEF-1234',
      description: funnelForm.description || 'Oportunidade gerada através da base de clientes.',
      category: funnelForm.category,
      value: funnelForm.value,
      priority: funnelForm.priority,
      stage: funnelForm.stage,
      dateCreated: 'Agora mesmo'
    };

    setLeads(prev => [newLead, ...prev]);
    setFunnelFeedback(`Oportunidade criada para "${customerForFunnel.name}" no Funil de Vendas com sucesso!`);
    setTimeout(() => {
      setFunnelFeedback(null);
      setCustomerForFunnel(null);
      setFunnelForm({
        description: '',
        category: 'Diagnóstico',
        value: '',
        priority: 'NORMAL',
        stage: 'leads',
      });
    }, 2000);
  };

  // Brand adding inline state for filters
  const [isAddingBrandInFilter, setIsAddingBrandInFilter] = useState(false);
  const [newFilterBrandInput, setNewFilterBrandInput] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Formatting helper
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // List filter logic
  let filteredCustomers = [...customers];

  // 1. Filter by keyword (Search query from navbar)
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filteredCustomers = filteredCustomers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.vehicleModel.toLowerCase().includes(q) ||
      c.vehiclePlate.toLowerCase().includes(q) ||
      c.vehicleBrand.toLowerCase().includes(q)
    );
  }

  // 2. Active filter choices
  if (activeFilter === 'VALOR') {
    filteredCustomers = filteredCustomers.filter(c => c.totalSpent > 30000);
  } else if (activeFilter === 'RECENTE') {
    filteredCustomers = filteredCustomers.filter(c => c.joinDate.startsWith('2025') || c.joinDate.startsWith('2026'));
  } else if (activeFilter === 'INATIVO') {
    filteredCustomers = filteredCustomers.filter(c => c.status === 'INATIVO');
  }

  // 3. Filter by brand options
  if (selectedBrandFilter !== '') {
    filteredCustomers = filteredCustomers.filter(c => c.vehicleBrand === selectedBrandFilter);
  }

  const handleAddBrandConfirm = () => {
    const trimmed = newFilterBrandInput.trim();
    if (trimmed) {
      const capitalized = trimmed.toUpperCase();
      if (!brandsList.includes(capitalized)) {
        setBrandsList(prev => [...prev, capitalized].sort());
      }
      setSelectedBrandFilter(capitalized);
      setIsAddingBrandInFilter(false);
      setNewFilterBrandInput('');
    }
  };

  // Pagination bounds
  const totalItemsCount = filteredCustomers.length;
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Edit save triggers
  const handleSaveCustomer = () => {
    if (!editingCustomer) return;
    setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    setEditingCustomer(null);
  };

  return (
    <div id="customer-base-content" className="p-8 space-y-6 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-80px)] font-sans">
      
      {/* Search info section */}
      <div id="customer-view-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Count Card from reference Image 1 */}
        <div id="customer-stat-header-box" className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-4 min-w-[200px] shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tighter text-white">{customers.length + 1243}</h1>
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">Clientes Registrados</p>
          </div>
        </div>

        {/* Filter Selection Panel matching Image 1 */}
        <div id="customer-filters-list" className="flex flex-wrap items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl">
          
          <button
            id="filter-btn-all"
            onClick={() => { setActiveFilter('ALL'); setCurrentPage(1); }}
            className={`font-mono text-[10px] font-semibold py-2 px-4 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'ALL' 
                ? 'bg-red-650 text-white shadow' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Todos os Clientes
          </button>

          <button
            id="filter-btn-valor"
            onClick={() => { setActiveFilter('VALOR'); setCurrentPage(1); }}
            className={`font-mono text-[10px] font-semibold py-2 px-4 border border-transparent rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'VALOR' 
                ? 'bg-red-650 text-white shadow' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Alto Valor
          </button>

          <button
            id="filter-btn-recentes"
            onClick={() => { setActiveFilter('RECENTE'); setCurrentPage(1); }}
            className={`font-mono text-[10px] font-semibold py-2 px-4 border border-transparent rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'RECENTE' 
                ? 'bg-red-650 text-white shadow' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Recentes
          </button>

          <button
            id="filter-btn-inativos"
            onClick={() => { setActiveFilter('INATIVO'); setCurrentPage(1); }}
            className={`font-mono text-[10px] font-semibold py-2 px-4 border border-transparent rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === 'INATIVO' 
                ? 'bg-red-650 text-white shadow' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Inativos
          </button>

          <div className="w-px h-6 bg-zinc-800 mx-2" />

          {/* More Filters click trigger */}
          <button
            id="filter-btn-more"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="font-mono text-[10px] font-semibold py-2 px-4 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
            Mais Filtros
          </button>
        </div>

      </div>

      {/* Conditional Brands Selector options */}
      {showMoreFilters && (
        <div id="more-filters-bar" className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mr-2">Filtrar por montadora:</span>
          <button
            onClick={() => setSelectedBrandFilter('')}
            className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest cursor-pointer transition-all ${
              selectedBrandFilter === '' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-950 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            Todas Marcas
          </button>
          {brandsList.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrandFilter(brand)}
              className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest cursor-pointer transition-all ${
                selectedBrandFilter === brand ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-950 text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              {brand}
            </button>
          ))}

          <div className="w-px h-5 bg-zinc-800 mx-1" />

          {/* Add custom brands to filter */}
          {isAddingBrandInFilter ? (
            <div className="flex gap-1 items-center bg-zinc-950 border border-zinc-850 p-1 pl-2.5 rounded-lg">
              <input
                type="text"
                placeholder="Montadora..."
                value={newFilterBrandInput}
                onChange={e => setNewFilterBrandInput(e.target.value)}
                className="bg-transparent text-white font-mono text-[10px] uppercase outline-none px-1 w-24 py-0.5 placeholder-zinc-650"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddBrandConfirm();
                }}
              />
              <button
                onClick={handleAddBrandConfirm}
                className="bg-indigo-650 hover:bg-indigo-600 text-white font-mono font-bold text-[9px] py-1 px-2 rounded cursor-pointer uppercase"
              >
                +
              </button>
              <button
                onClick={() => setIsAddingBrandInFilter(false)}
                className="text-zinc-500 hover:text-white font-mono text-[9px] py-1 px-1.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingBrandInFilter(true)}
              className="font-mono text-[9px] font-bold border border-zinc-800 bg-zinc-950 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="w-3 h-3 text-red-550" />
              Adicionar Marca
            </button>
          )}
        </div>
      )}

      {/* Core Table Grid matching reference Image 1 layout */}
      <div id="customer-grid-table-wrapper" className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left" id="customer-base-table">
            <thead>
              <tr className="border-b border-zinc-850 font-mono text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
                <th className="py-4 pl-6 min-w-[200px]">Identificação do Cliente</th>
                <th className="py-4 min-w-[180px]">Veículo & Especificações</th>
                <th className="py-4 min-w-[180px]">Dados de Contato</th>
                <th className="py-4 text-right pr-12 min-w-[140px]">Soma Faturada</th>
                <th className="py-4 text-center pr-6 min-w-[110px]">Status CRM</th>
                <th className="py-4 text-center pr-6 min-w-[100px]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  onClick={() => setEditingCustomer(customer)}
                  className="border-b border-[#1d2021] hover:bg-[#1d2021]/60 cursor-pointer text-xs transition-all align-middle"
                >
                  
                  {/* Column 1: Client description with badge initials */}
                  <td className="py-5 pl-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold font-mono text-red-500 text-sm shadow flex-shrink-0">
                      {customer.avatarText}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-white text-sm tracking-tight">{customer.name}</p>
                      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        CRM ID: <span className="text-zinc-500 font-bold">{customer.id}</span>
                      </p>
                    </div>
                  </td>

                  {/* Column 2: Vehicle particulars with dynamic custom plate chip */}
                  <td className="py-5 align-middle">
                    <div className="space-y-1 text-left">
                      <p className="font-bold text-white text-xs leading-none">
                        {customer.vehicleBrand} {customer.vehicleModel}
                      </p>
                      <p className="font-mono text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <span>{customer.vehicleYear}</span>
                        <span className="text-zinc-700 font-black">•</span>
                        <span className="text-white bg-zinc-950 px-2.5 py-0.5 rounded text-[9px] border border-zinc-800 font-bold tracking-wider">
                          {customer.vehiclePlate}
                        </span>
                      </p>
                    </div>
                  </td>

                  {/* Column 3: Contacts */}
                  <td className="py-5 text-[#e1e3e4]/80 align-middle">
                    <div className="space-y-0.5 font-sans">
                      <p className="leading-snug hover:text-white transition-colors">{customer.email}</p>
                      <p className="font-mono text-[10px] text-[#ab8987] leading-none">{customer.phone}</p>
                    </div>
                  </td>

                  {/* Column 4: Revenue generated in bold font mono */}
                  <td className="py-5 text-right font-mono font-bold text-white pr-12 text-sm align-middle">
                    {formatBRL(customer.totalSpent)}
                  </td>

                  {/* Column 5: Badges styled according to layout */}
                  <td className="py-5 text-center pr-6 align-middle">
                    <span className={`font-mono text-[9px] px-2.5 py-1 rounded font-bold tracking-wider uppercase border ${
                      customer.status === 'VIP' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                      customer.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-transparent text-zinc-500 border-zinc-800'
                    }`}>
                      {customer.status === 'VIP' && 'VIP'}
                      {customer.status === 'ATIVO' && 'ATIVO'}
                      {customer.status === 'INATIVO' && 'INATIVO'}
                    </span>
                  </td>

                  {/* Column 6: Actions */}
                  <td className="py-5 text-center pr-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="Emitir Ordem de Serviço (O.S.)"
                        onClick={() => onNewOrderClick?.(customer.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 backdrop-blur-xs rounded-lg transition-all cursor-pointer inline-flex items-center justify-center outline-none border border-transparent hover:border-red-500/25"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title="Criar Oportunidade no Funil de Vendas"
                        onClick={() => {
                          setCustomerForFunnel(customer);
                          setFunnelForm({
                            description: `Oportunidade para ${customer.vehicleBrand} ${customer.vehicleModel}.`,
                            category: 'Diagnóstico',
                            value: '',
                            priority: 'NORMAL',
                            stage: 'leads',
                          });
                        }}
                        className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 backdrop-blur-xs rounded-lg transition-all cursor-pointer inline-flex items-center justify-center outline-none border border-transparent hover:border-indigo-500/20"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        title="Excluir Cliente"
                        onClick={() => setCustomerToDelete(customer)}
                        className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 backdrop-blur-xs rounded-lg transition-all cursor-pointer inline-flex items-center justify-center outline-none border border-transparent hover:border-red-500/25"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#ab8987]">
                    Não foram encontrados clientes para este filtro ou busca de texto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Footer with count and pagination styled exact to Image 1 */}
        <div id="table-footer-pagination" className="px-6 py-4 border-t border-[#2d2d2d] bg-[#161819] flex items-center justify-between">
          <span className="font-sans text-xs text-[#ab8987]">
            Exibindo {Math.min((currentPage - 1) * itemsPerPage + 1, totalItemsCount)} a {Math.min(currentPage * itemsPerPage, totalItemsCount)} de {totalItemsCount} {totalItemsCount === 1 ? 'cliente' : 'clientes'}
          </span>

          <div className="flex items-center gap-1" id="pagination-buttons">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-[4px] border border-[#2d2d2d] bg-[#111415] text-[#ab8987] hover:text-white transition-all ${
                currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#ff535b]'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-[#e1e3e4] px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-[4px] border border-[#2d2d2d] bg-[#111415] text-[#ab8987] hover:text-white transition-all ${
                currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#ff535b]'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* CUSTOMER DISPLAY / DETAILS EDIT MODAL */}
      {editingCustomer && (
        <div id="customer-details-modal" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 text-left space-y-5 relative shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <h4 className="font-semibold text-base text-white uppercase tracking-tight">Editar Registro: {editingCustomer.name}</h4>
                <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Identificador do Cliente: {editingCustomer.id}</p>
              </div>
              <button 
                onClick={() => setEditingCustomer(null)}
                className="w-8 h-8 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Nome Completo</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value, avatarText: e.target.value.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() })}
                    className="w-full bg-[#111415] border border-[#2d2d2d] text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Endereço de E-mail</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full bg-[#111415] border border-[#2d2d2d] text-white rounded px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Número de Telefone</label>
                  <input
                    type="text"
                    value={editingCustomer.phone}
                    onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full bg-[#111415] border border-[#2d2d2d] text-white rounded px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Status de Fidelidade</label>
                  <select
                    value={editingCustomer.status}
                    onChange={e => setEditingCustomer({ ...editingCustomer, status: e.target.value as Customer['status'] })}
                    className="w-full bg-[#111415] border border-[#2d2d2d] text-white rounded px-3 py-2 text-xs outline-none"
                  >
                    <option value="VIP">VIP</option>
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#111415] p-3 rounded border border-[#2d2d2d]">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Marca do Carro</label>
                  <input
                    type="text"
                    value={editingCustomer.vehicleBrand}
                    onChange={e => setEditingCustomer({ ...editingCustomer, vehicleBrand: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#2d2d2d] text-white rounded px-2 py-1.5 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Modelo do Carro</label>
                  <input
                    type="text"
                    value={editingCustomer.vehicleModel}
                    onChange={e => setEditingCustomer({ ...editingCustomer, vehicleModel: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#2d2d2d] text-white rounded px-2 py-1.5 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Placa</label>
                  <input
                    type="text"
                    value={editingCustomer.vehiclePlate}
                    onChange={e => setEditingCustomer({ ...editingCustomer, vehiclePlate: e.target.value.toUpperCase() })}
                    className="w-full bg-[#1a1a1a] border border-[#2d2d2d] text-white rounded px-2 py-1.5 text-xs outline-none uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] text-[#ab8987] uppercase">Faturamento Total do Cliente no CRM (R$)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={editingCustomer.totalSpent}
                    onChange={e => setEditingCustomer({ ...editingCustomer, totalSpent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#111415] border border-[#2d2d2d] text-white rounded pl-8 pr-3 py-2 text-xs outline-none"
                  />
                  <span className="font-mono text-xs text-[#ab8987] absolute left-3 top-2.5">R$</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-800 justify-end items-center">
              <button
                type="button"
                onClick={() => setCustomerToDelete(editingCustomer)}
                className="mr-auto border border-red-500/30 hover:border-red-500 bg-red-950/10 text-red-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Cliente
              </button>
              <button
                onClick={() => setEditingCustomer(null)}
                className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={handleSaveCustomer}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold text-xs py-2 px-5 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCLUSÃO/CONFIRMAÇÃO MODAL */}
      {customerToDelete && (
        <div id="delete-confirmation-modal" className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-zinc-900 border border-red-500/20 rounded-xl max-w-md w-full p-6 text-left space-y-5 relative shadow-2xl">
            <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <Trash2 className="w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-white uppercase tracking-tight">Confirmar Exclusão de Cliente</h4>
                <p className="font-mono text-[9px] text-zinc-500 mt-0.5">Esta ação não pode ser desfeita no CRM</p>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs text-zinc-300">
              <p>Tem certeza de que deseja remover permanentemente o registro do cliente:</p>
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-1">
                <p className="font-bold text-white text-sm">{customerToDelete.name}</p>
                <p className="font-mono text-[10px] text-zinc-500">ID: {customerToDelete.id}</p>
                <p className="text-zinc-400">{customerToDelete.vehicleBrand} {customerToDelete.vehicleModel} ({customerToDelete.vehiclePlate})</p>
              </div>
              <p className="text-red-400 font-mono text-[10px] uppercase tracking-wider">
                ⚠️ Atenção: Todos os históricos de faturamento e dados adicionais serão removidos deste painel.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
                  if (editingCustomer && editingCustomer.id === customerToDelete.id) {
                    setEditingCustomer(null);
                  }
                  setCustomerToDelete(null);
                }}
                className="bg-red-650 hover:bg-red-700 text-white font-mono font-bold text-xs py-2 px-5 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Sim, Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADICIONAR AO FUNIL / GERAR OPORTUNIDADE MODAL */}
      {customerForFunnel && (
        <div id="add-to-funnel-modal" className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-zinc-900 border border-indigo-500/20 rounded-xl max-w-lg w-full p-6 text-left space-y-5 relative shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <h4 className="font-semibold text-base text-white uppercase tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Gerar Oportunidade no Funil
                </h4>
                <p className="font-mono text-[9px] text-zinc-500 mt-1">Crie um lead para: {customerForFunnel.name}</p>
              </div>
              <button 
                onClick={() => setCustomerForFunnel(null)}
                className="w-8 h-8 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {funnelFeedback ? (
              <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-center text-xs space-y-2 py-8">
                <p className="font-bold font-mono text-[10px] uppercase tracking-wider">✔ Sucesso operacional</p>
                <p>{funnelFeedback}</p>
              </div>
            ) : (
              <div className="space-y-4 font-sans text-xs">
                {/* Visual customer info banner */}
                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-855 space-y-1 text-left">
                  <p className="font-bold text-white text-sm">{customerForFunnel.name}</p>
                  <p className="text-zinc-400 text-xs">
                    {customerForFunnel.vehicleBrand} {customerForFunnel.vehicleModel} ({customerForFunnel.vehiclePlate}) - {customerForFunnel.phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-500 uppercase">Categoria</label>
                    <select
                      value={funnelForm.category}
                      onChange={(e) => setFunnelForm({ ...funnelForm, category: e.target.value as Lead['category'] })}
                      className="w-full bg-[#111415] border border-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:border-indigo-500 font-sans"
                    >
                      <option value="Diagnóstico">Diagnóstico</option>
                      <option value="Tuning">Tuning</option>
                      <option value="Revisão">Revisão</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Upgrade">Upgrade</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-500 uppercase">Etapa do Funil</label>
                    <select
                      value={funnelForm.stage}
                      onChange={(e) => setFunnelForm({ ...funnelForm, stage: e.target.value })}
                      className="w-full bg-[#111415] border border-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:border-indigo-500 font-sans"
                    >
                      {funnelStages && funnelStages.length > 0 ? (
                        funnelStages.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.title}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="leads">Novo Lead</option>
                          <option value="quotes">Orçamento Enviado</option>
                          <option value="negotiation">Negociação</option>
                          <option value="approved">Serviço Aprovado</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-500 uppercase">Prioridade</label>
                    <select
                      value={funnelForm.priority}
                      onChange={(e) => setFunnelForm({ ...funnelForm, priority: e.target.value as Lead['priority'] })}
                      className="w-full bg-[#111415] border border-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:border-indigo-500 font-sans"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="ALTA">ALTA</option>
                      <option value="URGENTE">URGENTE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-zinc-500 uppercase">Valor Estimado (R$)</label>
                    <input
                      type="number"
                      placeholder="Ex: 1200"
                      value={funnelForm.value}
                      onChange={(e) => setFunnelForm({ ...funnelForm, value: e.target.value !== '' ? parseFloat(e.target.value) : '' })}
                      className="w-full bg-[#111415] border border-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="font-mono text-[10px] text-zinc-500 uppercase pb-1 block">Descrição dos Sintomas / Notas</label>
                  <textarea
                    placeholder="Quais os sintomas, observações ou queixas do cliente para este veículo?"
                    value={funnelForm.description}
                    onChange={(e) => setFunnelForm({ ...funnelForm, description: e.target.value })}
                    className="w-full bg-[#111415] border border-zinc-800 text-white rounded px-3 py-2 text-xs outline-none focus:border-indigo-500 h-20 resize-none font-sans"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setCustomerForFunnel(null)}
                    className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddToFunnelSubmit}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-mono font-bold text-xs py-2 px-5 rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Adicionar no Funil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
