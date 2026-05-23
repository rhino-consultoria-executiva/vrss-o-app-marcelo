import React, { useState } from 'react';
import { X, UserPlus, FileSpreadsheet } from 'lucide-react';
import { Customer } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  customers: Customer[];
  brandsList: string[];
  setBrandsList: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CustomerModal({
  isOpen,
  onClose,
  setCustomers,
  customers,
  brandsList,
  setBrandsList
}: CustomerModalProps) {
  // Input fields initial state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState(brandsList[0] || 'BMW');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState<number>(2021);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'VIP'>('ATIVO');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');

  if (!isOpen) return null;

  const handleCreateCustomer = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg("Por favor digite o nome completo do cliente.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Por favor adicione um telefone de contato.");
      return;
    }
    if (!vehicleModel.trim()) {
      setErrorMsg("Por favor informe o modelo do veículo.");
      return;
    }

    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const generatedId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    const freshCustomer: Customer = {
      id: generatedId,
      name,
      email: email || `${name.toLowerCase().replace(/\s/g, '')}@email.com`,
      phone,
      totalSpent: 0.00,
      status,
      avatarText: initials,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehiclePlate: vehiclePlate.toUpperCase() || 'ABC-1234',
      joinDate: new Date().toISOString().split('T')[0]
    };

    setCustomers(prev => [freshCustomer, ...prev]);
    setSuccessMsg(`Cliente "${name}" cadastrado com sucesso! ID: ${generatedId}`);
    
    // Automatically close modal after 1.5s success visual feedback
    setTimeout(() => {
      onClose();
      // Reset parameters
      setName('');
      setEmail('');
      setPhone('');
      setVehicleBrand('BMW');
      setVehicleModel('');
      setVehicleYear(2021);
      setVehiclePlate('');
      setStatus('ATIVO');
      setSuccessMsg(null);
    }, 1500);
  };

  return (
    <div id="add-customer-modal-window" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 text-left space-y-5 relative font-sans text-zinc-100 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="font-semibold text-base text-white uppercase tracking-tight">Cadastrar Novo Cliente CRM</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Registre dados de proprietários e especificações de frotas no sistema.</p>
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
          <div className="bg-red-500/10 border border-red-500/35 text-red-500 px-4 py-2.5 rounded-lg text-xs font-mono select-text">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-4 py-2.5 rounded-lg text-xs font-mono select-text">
            ✓ {successMsg}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] text-zinc-500 uppercase">Nome Completo *</label>
              <input
                type="text"
                placeholder="ex: Roberto Silva"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] text-zinc-500 uppercase">Endereço de E-mail</label>
              <input
                type="email"
                placeholder="ex: roberto@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] text-zinc-500 uppercase">Telefone Celular *</label>
              <input
                type="text"
                placeholder="ex: +55 11 98111-5432"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] text-zinc-500 uppercase">Grupo Fidelidade</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'ATIVO' | 'VIP')}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
              >
                <option value="ATIVO" className="bg-zinc-900">ATIVO (Comum)</option>
                <option value="VIP" className="bg-zinc-900">VIP (Alta Performance)</option>
              </select>
            </div>
          </div>

          {/* Vehicle grouping card */}
          <div className="space-y-3 bg-zinc-950 p-3.5 rounded-lg border border-zinc-850">
            <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-wider block">Especificações Iniciais do Veículo</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-0.5">
                  <label className="font-mono text-[9px] text-zinc-500 uppercase">Marca Montadora</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingNewBrand(!isAddingNewBrand);
                      setNewBrandInput('');
                    }}
                    className="text-[9px] hover:text-white text-indigo-400 font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {isAddingNewBrand ? "← Selecionar" : "+ Nova Marca"}
                  </button>
                </div>
                
                {isAddingNewBrand ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Ex: Volvo"
                      value={newBrandInput}
                      onChange={e => setNewBrandInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-indigo-500/50 text-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newBrandInput.trim();
                        if (trimmed) {
                          const capitalized = trimmed.toUpperCase();
                          if (!brandsList.includes(capitalized)) {
                            setBrandsList(prev => [...prev, capitalized].sort());
                          }
                          setVehicleBrand(capitalized);
                          setIsAddingNewBrand(false);
                          setNewBrandInput('');
                        }
                      }}
                      className="bg-indigo-650 hover:bg-indigo-600 text-white font-mono font-bold text-[10px] px-2.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <select
                    value={vehicleBrand}
                    onChange={e => setVehicleBrand(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                  >
                    {brandsList.map(b => (
                      <option key={b} value={b} className="bg-zinc-900">{b}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] text-zinc-500">Modelo do Veículo *</label>
                <input
                  type="text"
                  placeholder="ex: RS6 Avant"
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-[9px] text-zinc-500">Ano Fabricação</label>
                <input
                  type="number"
                  placeholder="Ano"
                  value={vehicleYear}
                  onChange={e => setVehicleYear(parseInt(e.target.value) || 2021)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] text-zinc-500">Placa Licença</label>
                <input
                  type="text"
                  placeholder="ex: OSX-8800"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none uppercase focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-zinc-850 justify-end">
          <button
            onClick={onClose}
            className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateCustomer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono text-xs py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
          >
            Confirmar Cadastro
          </button>
        </div>

      </div>
    </div>
  );
}
