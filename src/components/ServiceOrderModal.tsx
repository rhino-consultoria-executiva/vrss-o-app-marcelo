import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, ClipboardCheck } from 'lucide-react';
import { Customer, ServiceOrder } from '../types';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  serviceOrders: ServiceOrder[];
  setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
  initialCustomerId?: string;
}

export default function ServiceOrderModal({
  isOpen,
  onClose,
  customers,
  setCustomers,
  serviceOrders,
  setServiceOrders,
  initialCustomerId
}: ServiceOrderModalProps) {
  // Order parameters
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  // Auto-filled vehicle spec parameters 
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Cost items parameters
  const [items, setItems] = useState<{ description: string; quantity: number; price: number }[]>([
    { description: 'Mão de obra de diagnóstico geral', quantity: 1, price: 450.00 }
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Customer addition states
  const [showQuickCustomerForm, setShowQuickCustomerForm] = useState(false);
  const [quickCustError, setQuickCustError] = useState<string | null>(null);
  const [quickCustSuccess, setQuickCustSuccess] = useState<string | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickBrand, setQuickBrand] = useState('');
  const [quickModel, setQuickModel] = useState('');
  const [quickPlate, setQuickPlate] = useState('');
  const [quickYear, setQuickYear] = useState('');

  // Preselect dynamic customer when opened with initialCustomerId
  useEffect(() => {
    if (isOpen && initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [isOpen, initialCustomerId]);

  const handleCreateQuickCustomer = () => {
    setQuickCustError(null);
    setQuickCustSuccess(null);

    if (!quickName.trim()) {
      setQuickCustError("Nome do cliente é obrigatório.");
      return;
    }
    if (!quickBrand.trim()) {
      setQuickCustError("A marca do carro é obrigatória.");
      return;
    }
    if (!quickModel.trim()) {
      setQuickCustError("O modelo do carro é obrigatório.");
      return;
    }
    if (!quickPlate.trim()) {
      setQuickCustError("A placa do carro é obrigatória.");
      return;
    }

    const yearNum = quickYear.trim() ? parseInt(quickYear.trim(), 10) : new Date().getFullYear();
    const finalYear = isNaN(yearNum) ? new Date().getFullYear() : yearNum;

    const newId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = quickName.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CX';

    const newCustomer: Customer = {
      id: newId,
      name: quickName.trim(),
      email: `${quickName.trim().toLowerCase().replace(/\s+/g, '.')}@email.com`,
      phone: quickPhone.trim() || '+55 11 99999-9999',
      totalSpent: 0,
      status: 'ATIVO',
      avatarText: initials,
      vehicleBrand: quickBrand.trim(),
      vehicleModel: quickModel.trim(),
      vehiclePlate: quickPlate.trim().toUpperCase(),
      vehicleYear: finalYear,
      joinDate: new Date().toISOString().split('T')[0]
    };

    // Add to global customers list
    setCustomers(prev => [newCustomer, ...prev]);
    setSelectedCustomerId(newId);
    setQuickCustSuccess(`Cliente ${quickName} cadastrado com sucesso!`);

    // Reset and hide form
    setTimeout(() => {
      setQuickName('');
      setQuickPhone('');
      setQuickBrand('');
      setQuickModel('');
      setQuickPlate('');
      setQuickYear('');
      setShowQuickCustomerForm(false);
      setQuickCustSuccess(null);
    }, 1500);
  };

  // If customer is selected, pre-populate vehicle specifications instantly!
  useEffect(() => {
    if (selectedCustomerId) {
      const match = customers.find(c => c.id === selectedCustomerId);
      if (match) {
        setVehicleBrand(match.vehicleBrand);
        setVehicleModel(match.vehicleModel);
        setVehiclePlate(match.vehiclePlate);
      }
    } else {
      setVehicleBrand('');
      setVehicleModel('');
      setVehiclePlate('');
    }
  }, [selectedCustomerId, customers]);

  if (!isOpen) return null;

  // Add parts/labor cost row
  const addCostRow = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, price: 100.00 }]);
  };

  const removeCostRow = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCostItem = (idx: number, field: 'description' | 'quantity' | 'price', value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      return { ...item, [field]: value };
    }));
  };

  // Create Service Order
  const handleCreateOrder = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedCustomerId) {
      setErrorMsg("Por favor selecione um cliente registrado.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Por favor adicione uma descrição do sintoma ou serviço solicitado.");
      return;
    }

    const customerMatch = customers.find(c => c.id === selectedCustomerId);
    if (!customerMatch) return;

    const totalCalculatedValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const generatedId = `OS-${Math.floor(4504 + Math.random() * 500)}`;
    const newServiceOrder: ServiceOrder = {
      id: generatedId,
      customerId: selectedCustomerId,
      customerName: customerMatch.name,
      vehicleBrand,
      vehicleModel,
      vehiclePlate,
      description,
      status: 'diagnostico', // default state
      totalValue: totalCalculatedValue,
      items,
      dateCreated: new Date().toISOString().split('T')[0],
      notes
    };

    // Update orders list
    setServiceOrders(prev => [newServiceOrder, ...prev]);

    // Track total spent on CRM for the customer
    setCustomers(prevCustomers => prevCustomers.map(c => {
      if (c.id === selectedCustomerId) {
        return {
          ...c,
          totalSpent: c.totalSpent + totalCalculatedValue,
          status: c.status === 'INATIVO' ? 'ATIVO' : c.status
        };
      }
      return c;
    }));

    setSuccessMsg(`Ordem de serviço ${generatedId} criada com sucesso para ${customerMatch.name}!`);
    
    setTimeout(() => {
      onClose();
      // Reset fields
      setSelectedCustomerId('');
      setDescription('');
      setNotes('');
      setItems([{ description: 'Mão de obra de diagnóstico geral', quantity: 1, price: 450.00 }]);
      setSuccessMsg(null);
    }, 1500);
  };

  return (
    <div id="service-order-modal-window" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 text-left space-y-6 relative max-h-[90vh] overflow-y-auto font-sans text-zinc-100 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-base text-white uppercase tracking-tight">Emitir Nova Ordem de Serviço</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Vincule clientes e detalhe as especificações dos defeitos mecânicos e peças.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/35 text-red-550 px-4 py-2.5 rounded-lg text-xs font-mono select-text">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-4 py-2.5 rounded-lg text-xs font-mono select-text">
            ✓ {successMsg}
          </div>
        )}

        {/* Form elements */}
        <div className="space-y-5">
          
          {/* Customer Selection */}
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex justify-between items-center">
              <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Selecione o Cliente Cadastrado *</label>
              <button
                type="button"
                onClick={() => setShowQuickCustomerForm(!showQuickCustomerForm)}
                className="font-mono text-[9px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1 uppercase cursor-pointer"
              >
                {showQuickCustomerForm ? '✕ Cancelar Cadastro' : '➕ Cadastrar Novo Rápido'}
              </button>
            </div>

            {showQuickCustomerForm ? (
              <div id="quick-add-customer-panel" className="bg-zinc-950 p-4 rounded-xl border border-red-500/20 space-y-4 text-xs mt-1 animate-fade-in">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Cadastro Rápido de Cliente</span>
                
                {quickCustError && (
                  <div className="bg-red-500/10 border border-red-500/25 text-red-400 py-1.5 px-3 rounded text-[10px] font-mono select-text">
                    ⚠️ {quickCustError}
                  </div>
                )}
                {quickCustSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 py-1.5 px-3 rounded text-[10px] font-mono select-text">
                    ✓ {quickCustSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase">Nome Completo *</label>
                    <input
                      type="text"
                      placeholder="Ex: João da Silva"
                      value={quickName}
                      onChange={e => setQuickName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase">Telefone de Contato</label>
                    <input
                      type="text"
                      placeholder="Ex: +55 11 98765-4321"
                      value={quickPhone}
                      onChange={e => setQuickPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase">Montadora *</label>
                    <input
                      type="text"
                      placeholder="Ex: Audi"
                      value={quickBrand}
                      onChange={e => setQuickBrand(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2 py-2 text-xs outline-none focus:border-red-500 uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase">Modelo *</label>
                    <input
                      type="text"
                      placeholder="Ex: RS6"
                      value={quickModel}
                      onChange={e => setQuickModel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2 py-2 text-xs outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase">Placa *</label>
                    <input
                      type="text"
                      placeholder="Ex: MCQ8080"
                      value={quickPlate}
                      onChange={e => setQuickPlate(e.target.value.toUpperCase())}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2 py-2 text-xs outline-none focus:border-red-500 uppercase text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-zinc-500 uppercase">Ano</label>
                    <input
                      type="text"
                      placeholder="Ex: 2024"
                      value={quickYear}
                      onChange={e => setQuickYear(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2 py-2 text-xs outline-none focus:border-red-500 text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickCustomerForm(false)}
                    className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-[10px] py-1.5 px-3 rounded-lg cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateQuickCustomer}
                    className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-[10px] py-1.5 px-4 rounded-lg cursor-pointer uppercase tracking-wider"
                  >
                    Confirmar Cadastro Rápido
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2.5 text-xs outline-none focus:border-red-500 transition-all font-sans"
              >
                <option value="" className="bg-zinc-900">-- Selecione um Cliente da Lista --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">{c.name} ({c.vehicleBrand} {c.vehicleModel} - Placa: {c.vehiclePlate})</option>
                ))}
              </select>
            )}
          </div>

          {/* Auto Filled Vehicle card details */}
          {selectedCustomerId && (
            <div id="auto-filled-vehicle-card" className="grid grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-lg border border-red-500/20 text-xs">
              <div>
                <span className="font-mono text-[9px] text-zinc-550 block uppercase">MONTADORA</span>
                <span className="text-white font-bold block mt-1">{vehicleBrand}</span>
              </div>
              <div>
                <span className="font-mono text-[9px] text-zinc-550 block uppercase">MODELO VEÍCULO</span>
                <span className="text-white font-bold block mt-1">{vehicleModel}</span>
              </div>
              <div>
                <span className="font-mono text-[9px] text-zinc-550 block uppercase">PLACA DE CONTROLE</span>
                <span className="font-mono text-xs text-red-500 font-extrabold block mt-1 uppercase">{vehiclePlate}</span>
              </div>
            </div>
          )}

          {/* Service Description */}
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] text-zinc-550 uppercase tracking-wider block">Trabalho Solicitado / Sintoma Relatado *</label>
            <textarea
              rows={3}
              placeholder="Descreva detalhadamente o sintoma do carro ou o upgrade requisitado..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 text-xs outline-none focus:border-red-500 resize-none font-sans"
            />
          </div>

          {/* Cost Items Grid list table builder */}
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-1">
              <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-wider">Itemização de Peças e Mão de Obra</span>
              <button
                onClick={addCostRow}
                className="font-mono text-[9px] font-semibold text-red-500 hover:text-red-400 flex items-center gap-0.5 uppercase cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Adicionar Custo Row
              </button>
            </div>

            {/* Rows list container */}
            <div className="space-y-3 sm:space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-zinc-950/20 sm:bg-transparent p-3 sm:p-0 border border-zinc-800 sm:border-none rounded-xl">
                  <input
                    type="text"
                    placeholder="Descrição do serviço ou peça..."
                    value={it.description}
                    onChange={e => updateCostItem(idx, 'description', e.target.value)}
                    className="w-full sm:w-1/2 bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-red-500"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      placeholder="Qtd"
                      value={it.quantity}
                      onChange={e => updateCostItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-2 text-xs outline-none text-center focus:border-red-500"
                    />
                    <div className="relative flex-1 sm:w-28 sm:flex-initial">
                      <input
                        type="number"
                        placeholder="Preço Unit."
                        value={it.price}
                        onChange={e => updateCostItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg pl-6 pr-2 py-2 text-xs outline-none focus:border-red-500"
                      />
                      <span className="font-mono text-[10px] text-zinc-500 absolute left-2 top-2.5">R$</span>
                    </div>
                    <button
                      onClick={() => removeCostRow(idx)}
                      disabled={items.length === 1}
                      className="text-zinc-500 hover:text-rose-400 disabled:opacity-30 p-2 cursor-pointer transition-colors flex items-center justify-center border border-zinc-850 sm:border-none rounded-lg"
                      title="Remover Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Display subtotal estimate */}
            <div className="text-right pt-2 font-mono text-[11px] text-zinc-500">
              VALOR TOTAL DA OS: <span className="text-white font-bold ml-1">R$ {items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Supervisor Notes */}
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Anotações Internas Técnicas (Opcional)</label>
            <input
              type="text"
              placeholder="ex: Cuidado com rodas forjadas de titânio..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-red-500"
            />
          </div>

        </div>

        {/* Modal actions */}
        <div className="flex gap-3 pt-4 border-t border-zinc-850 justify-end">
          <button
            onClick={onClose}
            className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateOrder}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold font-mono text-xs py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
          >
            Emitir Ordem de Serviço
          </button>
        </div>

      </div>
    </div>
  );
}
