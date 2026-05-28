import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  PlusCircle, 
  X, 
  MinusCircle, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  searchQuery: string;
}

export default function InventoryView({
  inventory,
  setInventory,
  searchQuery
}: InventoryViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  // Form state for creating inventory parts
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'Peças de Reposição' as InventoryItem['category'],
    sku: '',
    quantity: '' as any,
    price: '' as any,
    cost: '' as any,
    margin: '' as any,
    compatibilities: '',
    minStock: '' as any
  });

  // Category filter choices
  const categories: InventoryItem['category'][] = [
    'Peças de Reposição',
    'Performance',
    'Lubrificantes',
    'Pneus',
    'Eletrônica'
  ];

  // Formatting helper
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Filter items
  let filteredItems = [...inventory];

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.compatibilities.some(c => c.toLowerCase().includes(q))
    );
  }

  if (activeCategory !== 'ALL') {
    filteredItems = filteredItems.filter(item => item.category === activeCategory);
  }

  // Quick quantity steps
  const adjustQuantity = (itemId: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setInventory(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newQty = Math.max(0, item.quantity + delta);
      return { ...item, quantity: newQty };
    }));
  };

  // Add Item to inventory list
  const handleCreateItem = () => {
    const errors: Record<string, string> = {};
    
    if (!newItemForm.name.trim()) {
      errors.name = "Nome comercial é obrigatório.";
    }
    if (!newItemForm.sku.trim()) {
      errors.sku = "Código SKU é obrigatório.";
    }
    
    // Validate quantity
    if (newItemForm.quantity === undefined || newItemForm.quantity === null || newItemForm.quantity === '') {
      errors.quantity = "Quantidade inicial é obrigatória.";
    } else {
      const q = Number(newItemForm.quantity);
      if (isNaN(q)) {
        errors.quantity = "Insira uma quantidade válida.";
      } else if (q < 0) {
        errors.quantity = "Quantidade não pode ser negativa.";
      }
    }

    // Validate minStock
    if (newItemForm.minStock === undefined || newItemForm.minStock === null || newItemForm.minStock === '') {
      errors.minStock = "Alerta de estoque mínimo é obrigatório.";
    } else {
      const m = Number(newItemForm.minStock);
      if (isNaN(m)) {
        errors.minStock = "Insira uma quantidade válida.";
      } else if (m < 0) {
        errors.minStock = "O estoque mínimo não pode ser negativo.";
      }
    }

    // Validate price
    if (newItemForm.price === undefined || newItemForm.price === null || newItemForm.price === '') {
      errors.price = "Preço de venda é obrigatório.";
    } else {
      const p = Number(newItemForm.price);
      if (isNaN(p)) {
        errors.price = "Insira um preço válido.";
      } else if (p < 0) {
        errors.price = "Preço de venda não pode ser negativo.";
      }
    }

    // Validate cost
    if (newItemForm.cost !== undefined && newItemForm.cost !== null && newItemForm.cost !== '') {
      const c = Number(newItemForm.cost);
      if (isNaN(c)) {
        errors.cost = "Insira um custo válido.";
      } else if (c < 0) {
        errors.cost = "Preço de custo não pode ser negativo.";
      }
    }

    // Validate margin
    if (newItemForm.margin !== undefined && newItemForm.margin !== null && newItemForm.margin !== '') {
      const mar = Number(newItemForm.margin);
      if (isNaN(mar)) {
        errors.margin = "Insira uma margem válida.";
      } else if (mar < 0) {
        errors.margin = "Margem de lucro não pode ser negativa.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFeedbackMsg("Erro: Verifique os campos do formulário.");
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    const uniqueId = `STK-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const freshItem: InventoryItem = {
      id: uniqueId,
      name: newItemForm.name,
      category: newItemForm.category,
      sku: newItemForm.sku.toUpperCase(),
      quantity: Number(newItemForm.quantity),
      price: Number(newItemForm.price),
      compatibilities: newItemForm.compatibilities.split(',').map(c => c.trim()).filter(Boolean),
      minStock: Number(newItemForm.minStock),
      cost: newItemForm.cost !== '' ? Number(newItemForm.cost) : undefined,
      margin: newItemForm.margin !== '' ? Number(newItemForm.margin) : undefined
    };

    setInventory(prev => [...prev, freshItem]);
    setShowAddForm(false);
    setFormErrors({});
    setFeedbackMsg(`Sucesso! Peça "${freshItem.name}" cadastrada.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
    setNewItemForm({
      name: '',
      category: 'Peças de Reposição',
      sku: '',
      quantity: '',
      price: '',
      cost: '',
      margin: '',
      compatibilities: '',
      minStock: ''
    });
  };

  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInventory(prev => prev.filter(item => item.id !== itemId));
    setFeedbackMsg("Item excluído com sucesso do estoque.");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div id="inventory-view-content" className="p-8 space-y-6 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-80px)] font-sans">
      
      {/* Upper info panel */}
      <div id="inventory-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-855 pb-5">
        <div>
          <h3 className="font-semibold text-base text-white uppercase tracking-tight">Catálogo de Peças & Peças Forjadas</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Gestão de peças, lubrificantes de PDK, kits de tuning e bobinas de alta performance.</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg shadow-indigo-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Cadastrar Novo Item
        </button>
      </div>

      {/* Category selector chips */}
      <div id="inventory-categories-bar" className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest cursor-pointer transition-all ${
            activeCategory === 'ALL' 
              ? 'bg-indigo-600 text-white shadow' 
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Todos os Setores (Ativos)
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest cursor-pointer transition-all ${
              activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table grid with technical zebra style */}
      <div id="inventory-table-wrapper" className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans" id="inventory-table">
            <thead>
              <tr className="border-b border-zinc-850 font-mono text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-900/50 no-wrap">
                <th className="py-4 pl-6 w-44">SKU / ID</th>
                <th className="py-4 w-96">Nome da Peça Reposição</th>
                <th className="py-4 w-52">Setor de Estoque</th>
                <th className="py-4 text-center w-40">Qtd Disponível</th>
                <th className="py-4 text-right w-44">Valor Unitário</th>
                <th className="py-4 pl-10 w-96">Compatibilidades Principais</th>
                <th className="py-4 text-center pr-6 w-28">Excluir</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isUnderStock = item.quantity <= item.minStock;

                return (
                  <tr 
                    key={item.id}
                    onClick={() => setEditingItem(item)}
                    className="border-b border-[#1d2021] hover:bg-[#1d2021]/60 text-xs text-[#e1e3e4]/90 transition-all cursor-pointer align-middle"
                  >
                    
                    {/* SKU Code ID */}
                    <td className="py-4.5 pl-6 font-mono text-indigo-400 font-semibold">
                      {item.sku}
                    </td>

                    {/* Part Name */}
                    <td className="py-4.5 font-semibold text-white text-sm max-w-sm">
                      {item.name}
                    </td>

                    {/* Sector category */}
                    <td className="py-4.5 font-mono text-zinc-500 font-semibold text-[10px] uppercase">
                      {item.category}
                    </td>

                    {/* Quantity count with inline adjust buttons */}
                    <td className="py-4.5 align-middle">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          title="Remover 1 Unidade"
                          onClick={(e) => adjustQuantity(item.id, -1, e)}
                          className="text-zinc-550 hover:text-indigo-400 transition-all cursor-pointer"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        
                        <span className={`font-mono font-bold text-sm w-8 text-center ${
                          item.quantity === 0 ? 'text-rose-500' :
                          isUnderStock ? 'text-amber-500' : 'text-white'
                        }`}>
                          {item.quantity}
                        </span>

                        <button
                          title="Adicionar 1 Unidade"
                          onClick={(e) => adjustQuantity(item.id, 1, e)}
                          className="text-zinc-550 hover:text-indigo-400 transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {isUnderStock && (
                          <span title="Reposição Imediata Necessária" className="text-amber-500">
                            <AlertTriangle className="w-4 h-4 animate-bounce" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unit price */}
                    <td className="py-4.5 text-right font-mono font-bold text-white text-sm">
                      {formatBRL(item.price)}
                    </td>

                    {/* Compatibility list chips */}
                    <td className="py-4.5 pl-10 text-left align-middle max-w-xs truncate">
                      <div className="flex flex-wrap gap-1.5 justify-start">
                        {item.compatibilities.map((comp, idx) => (
                          <span key={idx} className="font-mono text-[9px] bg-zinc-950 border border-zinc-850 text-indigo-400 px-2 py-0.5 rounded font-semibold">
                            {comp}
                          </span>
                        ))}
                        {item.compatibilities.length === 0 && (
                          <span className="text-[#ab8987] italic">Todas montadoras</span>
                        )}
                      </div>
                    </td>

                    {/* Delete column button */}
                    <td className="py-4.5 text-center pr-6 align-middle" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#ab8987] text-xs">
                    Nenhuma peça localizada no pátio de estoque de reposição.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW PRODUCT MODAL WINDOW */}
      {showAddForm && (
        <div id="add-item-modal" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 text-left space-y-5 relative shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
              <div>
                <h4 className="font-semibold text-base text-white uppercase tracking-tight">Cadastrar Item no Estoque</h4>
                <p className="font-mono text-[10px] text-zinc-500">Os novos produtos atualizam imediatamente o painel de ordens do supervisor</p>
              </div>
              <button onClick={() => { setShowAddForm(false); setFormErrors({}); }} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] text-[#ab8987] uppercase">Nome Comercial do Produto</label>
                <input
                  type="text"
                  placeholder="ex: Pastilha de Freio Brembo Blue-Series"
                  value={newItemForm.name}
                  onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className={`w-full bg-[#111415] border ${formErrors.name ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-medium font-sans mt-0.5">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Código Identificação SKU</label>
                  <input
                    type="text"
                    placeholder="ex: BRM-FL-741"
                    value={newItemForm.sku}
                    onChange={e => setNewItemForm({ ...newItemForm, sku: e.target.value })}
                    className={`w-full bg-[#111415] border ${formErrors.sku ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs font-mono outline-none uppercase focus:border-[#ff535b]`}
                  />
                  {formErrors.sku && <p className="text-[10px] text-red-500 font-medium font-sans mt-0.5">{formErrors.sku}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Setor / Setor de Depósito</label>
                  <select
                    value={newItemForm.category}
                    onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value as InventoryItem['category'] })}
                    className="w-full bg-[#111415] border border-[#2d2d2d] text-white rounded px-3 py-2 text-xs outline-none"
                  >
                    <option value="Peças de Reposição">Peças de Reposição</option>
                    <option value="Performance">Performance</option>
                    <option value="Lubrificantes">Lubrificantes</option>
                    <option value="Pneus">Pneus</option>
                    <option value="Eletrônica">Eletrônica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Qtd Inicial</label>
                  <input
                    type="number"
                    value={newItemForm.quantity}
                    placeholder="Qtd Inicial"
                    onChange={e => {
                      const val = e.target.value;
                      setNewItemForm({ ...newItemForm, quantity: val === '' ? '' : parseInt(val, 10) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${formErrors.quantity ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {formErrors.quantity && <p className="text-[10px] text-red-500 font-medium font-sans mt-0.5">{formErrors.quantity}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Alerta Mín.</label>
                  <input
                    type="number"
                    value={newItemForm.minStock}
                    placeholder="Alerta Mín."
                    onChange={e => {
                      const val = e.target.value;
                      setNewItemForm({ ...newItemForm, minStock: val === '' ? '' : parseInt(val, 10) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${formErrors.minStock ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {formErrors.minStock && <p className="text-[10px] text-red-500 font-medium font-sans mt-0.5">{formErrors.minStock}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Preço Venda (R$)</label>
                  <input
                    type="number"
                    value={newItemForm.price}
                    placeholder="Preço de Venda"
                    onChange={e => {
                      const val = e.target.value;
                      setNewItemForm({ ...newItemForm, price: val === '' ? '' : parseFloat(val) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${formErrors.price ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {formErrors.price && <p className="text-[10px] text-red-500 font-medium font-sans mt-0.5">{formErrors.price}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Custo (R$)</label>
                  <input
                    type="number"
                    value={newItemForm.cost}
                    placeholder="Custo"
                    onChange={e => {
                      const val = e.target.value;
                      setNewItemForm({ ...newItemForm, cost: val === '' ? '' : parseFloat(val) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${formErrors.cost ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {formErrors.cost && <p className="text-[10px] text-red-500 font-medium font-sans mt-0.5">{formErrors.cost}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Margem (%)</label>
                  <input
                    type="number"
                    value={newItemForm.margin}
                    placeholder="Margem"
                    onChange={e => {
                      const val = e.target.value;
                      setNewItemForm({ ...newItemForm, margin: val === '' ? '' : parseFloat(val) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${formErrors.margin ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {formErrors.margin && <p className="text-[10px] text-red-500 font-medium font-sans mt-0.5">{formErrors.margin}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] text-[#ab8987] uppercase">Carros e Modelos Compatíveis (Separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="ex: Porsche 911 Carrera S, Audi RS6 Avant, BMW M4"
                  value={newItemForm.compatibilities}
                  onChange={e => setNewItemForm({ ...newItemForm, compatibilities: e.target.value })}
                  className="w-full bg-[#111415] border border-[#2d2d2d] text-white rounded px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-850 justify-end">
              <button
                onClick={() => { setShowAddForm(false); setFormErrors({}); }}
                className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateItem}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono text-xs py-2 px-5 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Confirmar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED UPDATE PRODUCT MODAL */}
      {editingItem && (
        <div id="edit-inventory-modal" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 text-left space-y-5 relative shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
              <div>
                <h4 className="font-semibold text-sm text-white uppercase tracking-tight">Editar Item estoque</h4>
                <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{editingItem.sku}</p>
              </div>
              <button onClick={() => { setEditingItem(null); setEditFormErrors({}); }} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] text-[#ab8987] uppercase">Nome do Produto</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className={`w-full bg-[#111415] border ${editFormErrors.name ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                />
                {editFormErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{editFormErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] text-[#ab8987] uppercase">Preço Venda Unitário (R$)</label>
                <input
                  type="number"
                  placeholder="Preço de Venda"
                  value={editingItem.price === undefined || editingItem.price === null ? '' : editingItem.price}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingItem({ ...editingItem, price: val === '' ? '' : parseFloat(val) } as any);
                  }}
                  className={`w-full bg-[#111415] border ${editFormErrors.price ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                />
                {editFormErrors.price && <p className="text-[10px] text-red-500 mt-0.5">{editFormErrors.price}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Disponível</label>
                  <input
                    type="number"
                    placeholder="Disponível"
                    value={editingItem.quantity === undefined || editingItem.quantity === null ? '' : editingItem.quantity}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingItem({ ...editingItem, quantity: val === '' ? '' : parseInt(val, 10) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${editFormErrors.quantity ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {editFormErrors.quantity && <p className="text-[10px] text-red-500 mt-0.5">{editFormErrors.quantity}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Mínimo Alerta</label>
                  <input
                    type="number"
                    placeholder="Mínimo Alerta"
                    value={editingItem.minStock === undefined || editingItem.minStock === null ? '' : editingItem.minStock}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingItem({ ...editingItem, minStock: val === '' ? '' : parseInt(val, 10) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${editFormErrors.minStock ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {editFormErrors.minStock && <p className="text-[10px] text-red-500 mt-0.5">{editFormErrors.minStock}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Custo (custo)</label>
                  <input
                    type="number"
                    placeholder="Custo"
                    value={editingItem.cost === undefined || editingItem.cost === null ? '' : editingItem.cost}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingItem({ ...editingItem, cost: val === '' ? '' : parseFloat(val) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${editFormErrors.cost ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {editFormErrors.cost && <p className="text-[10px] text-red-500 mt-0.5">{editFormErrors.cost}</p>}
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[9px] text-[#ab8987] uppercase">Margem (margem)</label>
                  <input
                    type="number"
                    placeholder="Margem"
                    value={editingItem.margin === undefined || editingItem.margin === null ? '' : editingItem.margin}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingItem({ ...editingItem, margin: val === '' ? '' : parseFloat(val) } as any);
                    }}
                    className={`w-full bg-[#111415] border ${editFormErrors.margin ? 'border-red-500' : 'border-[#2d2d2d]'} text-white rounded px-3 py-2 text-xs outline-none focus:border-[#ff535b]`}
                  />
                  {editFormErrors.margin && <p className="text-[10px] text-red-500 mt-0.5">{editFormErrors.margin}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-855 justify-end">
              <button
                onClick={() => { setEditingItem(null); setEditFormErrors({}); }}
                className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  const errors: Record<string, string> = {};
                  if (!editingItem.name.trim()) {
                    errors.name = "Nome comercial é obrigatório.";
                  }
                  
                  // Quantity
                  if (editingItem.quantity === undefined || editingItem.quantity === null || (editingItem.quantity as any) === '') {
                    errors.quantity = "Quantidade é obrigatória.";
                  } else {
                    const q = Number(editingItem.quantity);
                    if (isNaN(q)) {
                      errors.quantity = "Insira uma quantidade válida.";
                    } else if (q < 0) {
                      errors.quantity = "Quantidade não pode ser negativa.";
                    }
                  }

                  // Min stock
                  if (editingItem.minStock === undefined || editingItem.minStock === null || (editingItem.minStock as any) === '') {
                    errors.minStock = "Alerta de estoque mínimo é obrigatório.";
                  } else {
                    const m = Number(editingItem.minStock);
                    if (isNaN(m)) {
                      errors.minStock = "Insira um estoque mínimo válido.";
                    } else if (m < 0) {
                      errors.minStock = "O estoque mínimo não pode ser negativo.";
                    }
                  }

                  // Price
                  if (editingItem.price === undefined || editingItem.price === null || (editingItem.price as any) === '') {
                    errors.price = "Preço de venda é obrigatório.";
                  } else {
                    const p = Number(editingItem.price);
                    if (isNaN(p)) {
                      errors.price = "Insira um preço válido.";
                    } else if (p < 0) {
                      errors.price = "Preço de venda não pode ser negativo.";
                    }
                  }

                  // Cost
                  if (editingItem.cost !== undefined && editingItem.cost !== null && (editingItem.cost as any) !== '') {
                    const c = Number(editingItem.cost);
                    if (isNaN(c)) {
                      errors.cost = "Insira um custo válido.";
                    } else if (c < 0) {
                      errors.cost = "Preço de custo não pode ser negativo.";
                    }
                  }

                  // Margin
                  if (editingItem.margin !== undefined && editingItem.margin !== null && (editingItem.margin as any) !== '') {
                    const mar = Number(editingItem.margin);
                    if (isNaN(mar)) {
                      errors.margin = "Insira uma margem válida.";
                    } else if (mar < 0) {
                      errors.margin = "Margem de lucro não pode ser negativa.";
                    }
                  }

                  if (Object.keys(errors).length > 0) {
                    setEditFormErrors(errors);
                    setFeedbackMsg("Erro: Valores inválidos ou negativos no estoque.");
                    setTimeout(() => setFeedbackMsg(null), 3000);
                    return;
                  }

                  setInventory(prev => prev.map(i => i.id === editingItem.id ? {
                    ...editingItem,
                    quantity: Number(editingItem.quantity),
                    price: Number(editingItem.price),
                    minStock: Number(editingItem.minStock),
                    cost: editingItem.cost !== '' && editingItem.cost !== undefined && editingItem.cost !== null ? Number(editingItem.cost) : undefined,
                    margin: editingItem.margin !== '' && editingItem.margin !== undefined && editingItem.margin !== null ? Number(editingItem.margin) : undefined
                  } : i));
                  setEditingItem(null);
                  setEditFormErrors({});
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold text-xs py-2 px-5 rounded-lg uppercase tracking-wider cursor-pointer font-black"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 border-l-4 border-red-500 border-zinc-800 rounded-xl p-4 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{feedbackMsg}</span>
        </div>
      )}

    </div>
  );
}
