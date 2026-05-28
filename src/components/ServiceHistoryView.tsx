import React, { useState } from 'react';
import { 
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Eye,
  Wrench,
  X,
  Printer,
  ChevronDown,
  Download,
  Copy,
  Check,
  FileDown,
  Trash2,
  Pencil,
  Plus
} from 'lucide-react';
import { ServiceOrder } from '../types';
import { jsPDF } from 'jspdf';

interface ServiceHistoryViewProps {
  serviceOrders: ServiceOrder[];
  setServiceOrders: React.Dispatch<React.SetStateAction<ServiceOrder[]>>;
  onNewOrderClick?: () => void;
  searchQuery?: string;
}

export default function ServiceHistoryView({
  serviceOrders,
  setServiceOrders,
  onNewOrderClick,
  searchQuery = ''
 }: ServiceHistoryViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [docType, setDocType] = useState<'orçamento' | 'recibo'>('orçamento');
  const [copied, setCopied] = useState(false);

  // CRUD Edit and Delete State
  const [orderToDelete, setOrderToDelete] = useState<ServiceOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState<{ description: string; quantity: number; price: number }[]>([]);

  const startEditing = (order: ServiceOrder) => {
    setEditDescription(order.description);
    setEditNotes(order.notes || '');
    setEditItems(order.items.map(it => ({ ...it })));
    setIsEditing(true);
  };

  const saveOrderEdits = () => {
    if (!selectedOrder) return;
    const updatedTotalValue = editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setServiceOrders(prev => prev.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          description: editDescription,
          notes: editNotes,
          items: editItems,
          totalValue: updatedTotalValue
        };
      }
      return o;
    }));

    setSelectedOrder(prev => prev ? {
      ...prev,
      description: editDescription,
      notes: editNotes,
      items: editItems,
      totalValue: updatedTotalValue
    } : null);

    setIsEditing(false);
  };

  // Format currencies
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Filter service orders by status
  let filteredOrders = statusFilter === 'ALL' 
    ? serviceOrders 
    : serviceOrders.filter(o => o.status === statusFilter);

  // Filter service orders by keyword
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filteredOrders = filteredOrders.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.vehicleBrand.toLowerCase().includes(q) ||
      o.vehicleModel.toLowerCase().includes(q) ||
      o.vehiclePlate.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      (o.notes && o.notes.toLowerCase().includes(q)) ||
      o.items.some(item => item.description.toLowerCase().includes(q))
    );
  }

  // Quick status updates from history dashboard
  const handleUpdateStatus = (orderId: string, newStatus: ServiceOrder['status']) => {
    setServiceOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Generate clean Proposal Text
  const generateProposalText = (order: ServiceOrder, type: 'orçamento' | 'recibo') => {
    const divider = '='.repeat(50);
    const itemsText = order.items.map(it => `- ${it.quantity}x ${it.description}: ${formatBRL(it.price * it.quantity)}`).join('\n');
    return `
${divider}
${type === 'orçamento' ? 'PROPOSTA DE ORÇAMENTO DE SERVIÇOS' : 'RECIBO DE PRESTAÇÃO DE SERVIÇOS'}
MC AUTOMECÂNICA & PERFORMANCE
CNPJ: 45.109.844/0001-92 - Fone: (11) 98765-4321
${divider}

DOCUMENTO REF: ${order.id}
DATA EMISSÃO: ${order.dateCreated}
STATUS ATUAL: ${order.status.toUpperCase()}

CLIENTE: ${order.customerName}
VEÍCULO: ${order.vehicleBrand} ${order.vehicleModel}
PLACA DO VEÍCULO: ${order.vehiclePlate}
SINTOMA / REQUISITO: ${order.description}

${divider}
ESPECIFICAÇÃO DE PRODUTOS E MÃO DE OBRA:
${itemsText}
${divider}

VALOR TOTAL DA OPERAÇÃO: ${formatBRL(order.totalValue)}

${type === 'orçamento' ? `TERMOS DO ORÇAMENTO:
* Este orçamento é uma estimativa válida por 10 dias úteis.
* Eventuais necessidades de novas peças serão informadas previamente.` : `RECIBO E RETIRADA:
* Prestação de serviço concluída com êxito.
* Valor integral quitado pelo cliente.`}

OBSERVAÇÕES ADICIONAIS:
${order.notes || 'Nenhuma nota técnica cadastrada.'}

${divider}
Gerado em ${new Date().toLocaleDateString('pt-BR')} - MC CRM Auto
Muito obrigado pela confiança!
${divider}
`.trim();
  };

  // TXT proposal download
  const handleDownloadTxt = (order: ServiceOrder, type: 'orçamento' | 'recibo') => {
    const text = generateProposalText(order, type);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type === 'orçamento' ? 'orcamento' : 'recibo'}_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF proposal download (A4 high-quality format)
  const handleDownloadPdf = async (order: ServiceOrder, type: 'orçamento' | 'recibo') => {
    const doc = new jsPDF();
    
    // Load Logo Base64
    const logoUrl = 'https://lh3.googleusercontent.com/d/1XOJO43B_azZaN1Ruy1nIW21diyXsFxUq';
    let logoBase64: string | null = null;
    try {
      logoBase64 = await new Promise<string | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        // Force timeout in case connection hangs
        setTimeout(() => resolve(null), 2500);
      });
    } catch (e) {
      console.error('Failed to load logo image:', e);
    }
    
    // Draw background & accent bands
    doc.setFillColor(24, 24, 27); // Zinc 900
    doc.rect(0, 0, 210, 42, 'F');
    
    // Performance red thin band
    doc.setFillColor(220, 38, 38); // Red 600
    doc.rect(0, 41, 210, 2, 'F');
    
    if (logoBase64) {
      // Draw Logo elegantly with white container
      doc.setFillColor(255, 255, 255);
      doc.rect(14, 8, 24, 24, 'F');
      doc.addImage(logoBase64, 'PNG', 15, 9, 22, 22);
      
      // Brand Header shifted to the right
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MC AUTOMECÂNICA & PERFORMANCE", 44, 18);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("CNPJ: 45.109.844/0001-92 - Fone: (11) 98765-4321", 44, 25);
      doc.text("Email: adm@mcautomecanica.com.br | São Paulo - SP", 44, 31);
    } else {
      // Brand Header (traditional fallback)
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.text("MC AUTOMECÂNICA & PERFORMANCE", 15, 18);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("CNPJ: 45.109.844/0001-92 - Fone: (11) 98765-4321", 15, 26);
      doc.text("Email: adm@mcautomecanica.com.br | São Paulo - SP", 15, 32);
    }
    
    // Header Badge Card
    doc.setFillColor(220, 38, 38); // Red-600
    doc.rect(142, 10, 53, 22, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    const titleText = type === 'orçamento' ? 'ORÇAMENTO' : 'RECIBO OFICIAL';
    doc.text(titleText, 147, 18);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`REF: OS-${order.id}`, 147, 26);
    
    // Client & Vehicle Card Row
    // Left performance pill accent
    doc.setFillColor(220, 38, 38); // Red-600
    doc.rect(15, 49.5, 2.5, 5.5, 'F');
    
    doc.setTextColor(24, 24, 27); // Zinc-900
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DADOS DO CLIENTE E VEÍCULO", 20, 54.5);
    
    doc.setDrawColor(228, 228, 231); // light divider
    doc.line(15, 58, 195, 58);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    
    // Left column
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(113, 113, 122); // Zinc 500
    doc.text("Cliente:", 15, 66);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(39, 39, 42); // Zinc 800
    doc.text(order.customerName, 30, 66);
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(113, 113, 122);
    doc.text("Sintoma:", 15, 73);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(39, 39, 42);
    const safeDesc = order.description.length > 70 ? order.description.substring(0, 70) + "..." : order.description;
    doc.text(safeDesc, 32, 73);
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(113, 113, 122);
    doc.text("Emissão:", 15, 80);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(39, 39, 42);
    doc.text(order.dateCreated, 32, 80);
    
    // Right column
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(113, 113, 122);
    doc.text("Veículo:", 110, 66);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(39, 39, 42);
    doc.text(`${order.vehicleBrand} ${order.vehicleModel}`, 125, 66);
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(113, 113, 122);
    doc.text("Placa:", 110, 73);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(185, 28, 28); // Premium red for plate number
    doc.text(order.vehiclePlate, 122, 73);
    
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(113, 113, 122);
    doc.text("Estágio:", 110, 80);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(39, 39, 42);
    doc.text(order.status.toUpperCase(), 125, 80);
    
    // Items table header
    // Left performance pill accent
    doc.setFillColor(220, 38, 38);
    doc.rect(15, 91.5, 2.5, 5.5, 'F');
    
    doc.setTextColor(24, 24, 27);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PEÇAS, COMPONENTES E MÃO DE OBRA", 20, 96.5);
    
    doc.setDrawColor(228, 228, 231);
    doc.line(15, 100, 195, 100);
    
    // Grid Header background
    doc.setFillColor(244, 244, 245);
    doc.rect(15, 103, 180, 8, 'F');
    // Header borders
    doc.setDrawColor(228, 228, 231);
    doc.line(15, 103, 195, 103);
    doc.line(15, 111, 195, 111);
    
    doc.setFontSize(8.5);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(113, 113, 122);
    doc.text("Descrição das Peças e Serviços", 18, 108.5);
    doc.text("Qtd", 140, 108.5);
    doc.text("Valor Unit.", 153, 108.5);
    doc.text("Valor Total", 175, 108.5);
    
    let currentY = 118;
    doc.setTextColor(39, 39, 42);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    
    order.items.forEach((item) => {
      if (currentY > 245) {
        doc.addPage();
        currentY = 25;
      }
      doc.setFont("Helvetica", "normal");
      doc.text(item.description, 18, currentY);
      doc.text(item.quantity.toString(), 141, currentY);
      doc.text(formatBRL(item.price), 153, currentY);
      doc.setFont("Helvetica", "bold");
      doc.text(formatBRL(item.price * item.quantity), 175, currentY);
      
      doc.setDrawColor(244, 244, 245);
      doc.line(15, currentY + 3, 195, currentY + 3);
      currentY += 8.5;
    });
    
    if (order.items.length === 0) {
      doc.setFont("Helvetica", "italic");
      doc.text("Nenhuma peça ou serviço registrado nesta O.S.", 18, currentY);
      currentY += 10;
    }
    
    // Total cost display card
    currentY += 4;
    doc.setFillColor(254, 242, 242);
    doc.rect(120, currentY, 75, 12, 'F');
    doc.setDrawColor(220, 38, 38);
    doc.rect(120, currentY, 75, 12, 'S');
    
    doc.setTextColor(185, 28, 28);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    const totalLabel = type === 'orçamento' ? "TOTAL ESTIMADO:" : "TOTAL QUITADO:";
    doc.text(totalLabel, 123, currentY + 7.5);
    
    doc.setFontSize(11);
    doc.text(formatBRL(order.totalValue), 158, currentY + 7.5);
    
    // Observations
    if (order.notes) {
      currentY += 18;
      if (currentY > 240) {
        doc.addPage();
        currentY = 25;
      }
      
      // Observations pill accent
      doc.setFillColor(220, 38, 38);
      doc.rect(15, currentY - 5, 2.5, 5.5, 'F');
      
      doc.setTextColor(24, 24, 27);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("OBSERVAÇÕES E NOTAS TÉCNICAS:", 20, currentY);
      
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(82, 82, 91);
      doc.setFontSize(8.5);
      const wrappedNotes = doc.splitTextToSize(order.notes, 175);
      doc.text(wrappedNotes, 15, currentY + 5.5);
      currentY += (wrappedNotes.length * 4) + 6;
    }
    
    // Footer Legal Terms and Signatures
    currentY += 14;
    if (currentY > 255) {
      doc.addPage();
      currentY = 25;
    }
    
    doc.setDrawColor(228, 228, 231);
    doc.line(15, currentY, 195, currentY);
    
    doc.setTextColor(120, 120, 120);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    if (type === 'orçamento') {
      doc.text("* Orçamento válido por 10 dias úteis. Depende da assinatura para início das ações mecânicas.", 15, currentY + 4.5);
      doc.text("* Garantia contratual aplicada de 90 dias com base no Código de Defesa do Consumidor brasileiro.", 15, currentY + 8);
    } else {
      doc.text("* Certificado de entrega mecânica e satisfação. Carro livre para circulação rodoviária regular.", 15, currentY + 4.5);
      doc.text("* Garantia assegurada de 90 dias sob mão de obra e peças descritas oficialmente nesta peça.", 15, currentY + 8);
    }
    
    // Signatures blocks
    currentY += 20;
    if (currentY > 270) {
      doc.addPage();
      currentY = 30;
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, currentY, 90, currentY);
    doc.line(120, currentY, 190, currentY);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text("MC AUTOMECÂNICA AUTORIZADO", 23, currentY + 5);
    doc.text("CLIENTE RESPONSÁVEL", 135, currentY + 5);
    
    // Save as PDF
    doc.save(`${type === 'orçamento' ? 'orcamento' : 'recibo'}_OS-${order.id}.pdf`);
  };

  // Copy proposal to clipboard
  const handleCopyToClipboard = (order: ServiceOrder, type: 'orçamento' | 'recibo') => {
    const text = generateProposalText(order, type);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="service-history-content" className="p-8 space-y-6 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-80px)] font-sans">
      
      {/* Filters bar */}
      <div id="history-filter-panel" className="flex flex-col gap-4 border-b border-zinc-850 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h3 className="font-semibold text-base text-white uppercase tracking-tight">Painel de Monitoramento Geral</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Clique em um serviço para atualizar seu status de reparo, gerir peças ou emitir orçamento.</p>
          </div>
          {onNewOrderClick && (
            <button
              onClick={onNewOrderClick}
              className="bg-red-650 hover:bg-red-700 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all uppercase self-start sm:self-center shrink-0 border border-transparent shadow hover:border-red-500/30"
            >
              <Plus className="w-4 h-4 text-white" />
              Emitir Nova O.S.
            </button>
          )}
        </div>

        <div className="flex gap-2 bg-zinc-900 p-1 border border-zinc-800 rounded-xl overflow-x-auto max-w-[calc(100vw-32px)] sm:max-w-none self-start">
          {['ALL', 'diagnostico', 'aguardando_pecas', 'execucao', 'entregue'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`font-mono text-[9px] font-bold px-3 py-2 rounded-lg uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === filter 
                  ? 'bg-red-600 text-white shadow' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {filter === 'ALL' && 'Todos Serviços'}
              {filter === 'diagnostico' && 'Sintomas'}
              {filter === 'aguardando_pecas' && 'Pendente Peça'}
              {filter === 'execucao' && 'Execução'}
              {filter === 'entregue' && 'Entregue & Pago'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      <div id="history-orders-list" className="grid grid-cols-1 gap-4">
        {filteredOrders.map((os) => {
          return (
            <div 
              key={os.id} 
              id={`os-item-${os.id}`}
              onClick={() => setSelectedOrder(os)}
              className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer transition-all hover:border-red-500/30 text-left shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Status icon indicators */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  os.status === 'entregue' ? 'bg-emerald-500/10 text-emerald-400' :
                  os.status === 'pronto' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  os.status === 'aguardando_pecas' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {os.status === 'entregue' ? <CheckCircle2 className="w-5 h-5" /> :
                   os.status === 'pronto' ? <CheckCircle2 className="w-5 h-5 animate-pulse" /> :
                   os.status === 'aguardando_pecas' ? <AlertTriangle className="w-5 h-5" /> :
                   <Clock className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-red-500">{os.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <span className="text-white font-semibold font-sans text-sm">{os.customerName}</span>
                    <span className="font-mono text-[9px] text-zinc-400 uppercase ml-2 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                      {os.vehiclePlate}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-zinc-400 mt-1">
                    {os.vehicleBrand} {os.vehicleModel} • <span className="text-white/60">{os.description}</span>
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="font-mono text-[9px] text-zinc-550 uppercase">DATA ENTRADA: {os.dateCreated}</span>
                    <span className="text-zinc-700">•</span>
                    <span className="font-mono text-[9px] text-zinc-550 uppercase">ITENS REPARO: {os.items.length}</span>
                  </div>
                </div>
              </div>

              {/* Status and money columns */}
              <div className="flex items-center gap-6 self-end md:self-center">
                <div className="text-right">
                  <span className="font-mono text-[9px] text-zinc-550 block uppercase">VALOR TOTAL</span>
                  <span className="font-mono text-sm font-bold text-white block mt-0.5">{formatBRL(os.totalValue)}</span>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    os.status === 'diagnostico' ? 'bg-red-550/10 text-red-400' :
                    os.status === 'aguardando_pecas' ? 'bg-amber-500/10 text-amber-500' :
                    os.status === 'execucao' ? 'bg-blue-500/10 text-blue-400' :
                    os.status === 'pronto' ? 'bg-emerald-500/10 text-emerald-300 font-extrabold' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {os.status === 'diagnostico' && 'SINTOMAS (DIAGNÓSTICO)'}
                    {os.status === 'aguardando_pecas' && 'AGUARDANDO PEÇAS'}
                    {os.status === 'execucao' && 'EM EXECUÇÃO'}
                    {os.status === 'pronto' && 'PRONTO PARA RETIRADA'}
                    {os.status === 'entregue' && 'ENTREGUE & PAGO'}
                  </span>
                  
                  {/* Quick toggle next stage dropdown or trigger */}
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      title="Ver Detalhes"
                      onClick={() => { setSelectedOrder(os); setDocType('orçamento'); setIsEditing(false); }}
                      className="text-zinc-400 hover:text-red-500 p-1 bg-zinc-950 hover:bg-red-500/10 border border-zinc-800 rounded transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Orçamento / Recibo"
                      onClick={() => { setSelectedOrder(os); setDocType('orçamento'); setIsEditing(false); }}
                      className="text-zinc-400 hover:text-red-500 p-1 bg-zinc-950 hover:bg-red-500/10 border border-zinc-800 rounded transition-all cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Excluir OS"
                      onClick={() => setOrderToDelete(os)}
                      className="text-zinc-500 hover:text-rose-500 p-1 bg-zinc-950 hover:bg-rose-500/10 border border-zinc-850 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="py-16 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            Nenhum registro de serviço encontrado para este filtro de monitoramento.
          </div>
        )}
      </div>

      {/* REPAIR ORDER & PRINT RECEIPTS DETAIL MODAL */}
      {selectedOrder && (
        <div id="service-receipt-modal" className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 text-left space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
              <div>
                <span className="font-mono text-[9px] text-red-500 font-bold">EMISSOR CENTRAL DE ORÇAMENTOS & LAUDOS</span>
                <h4 className="font-semibold text-base text-white uppercase tracking-tight mt-1">Ordem de Serviço: {selectedOrder.id}</h4>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-5 animate-fade-in text-left">
                <div className="text-sm font-bold text-white border-b border-zinc-850 pb-2 uppercase tracking-tight flex items-center justify-between">
                  <span>Modo Editor de Ordem de Serviço</span>
                  <span className="font-mono text-xs text-red-500">{selectedOrder.id}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">Sintoma Informado / Defeito Reclamado</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 text-xs outline-none focus:border-red-500 resize-none font-sans"
                    placeholder="Descrição do sintoma..."
                  />
                </div>

                {/* Edit items list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-1.5">
                    <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-wider">Itemização de Peças e Serviços</span>
                    <button
                      type="button"
                      onClick={() => setEditItems(prev => [...prev, { description: '', quantity: 1, price: 100.00 }])}
                      className="font-mono text-[9px] font-semibold text-red-555 hover:text-red-400 flex items-center gap-1 uppercase cursor-pointer"
                    >
                      + Adicionar Item Row
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editItems.map((it, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-zinc-950/25 p-1 rounded-lg sm:bg-transparent sm:p-0">
                        <input
                          type="text"
                          value={it.description}
                          onChange={e => {
                            const val = e.target.value;
                            setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, description: val } : item));
                          }}
                          placeholder="Filtro/Peça de Reposição..."
                          className="flex-1 bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-red-500"
                        />
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 1;
                            setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: val } : item));
                          }}
                          className="w-14 bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2 py-2 text-xs outline-none text-center focus:border-red-500"
                        />
                        <div className="relative w-24">
                          <input
                            type="number"
                            value={it.price}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, price: val } : item));
                            }}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg pl-5 pr-1 py-2 text-xs outline-none focus:border-red-500"
                          />
                          <span className="absolute left-1.5 top-2 ml-0.5 text-[9px] font-mono text-zinc-500">R$</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditItems(prev => prev.filter((_, i) => i !== idx))}
                          disabled={editItems.length === 1}
                          className="text-zinc-500 hover:text-rose-455 disabled:opacity-30 p-1 cursor-pointer"
                          title="Remover Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="text-right font-mono text-xs text-zinc-400">
                    SOMA ESTIMADA: <span className="text-red-500 font-bold font-sans">R$ {editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Observações Técnicas Internas</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-red-500"
                    placeholder="Instruções técnicas para a mecânica de pátio..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-zinc-850 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs py-2 px-4 rounded-lg cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={saveOrderEdits}
                    className="bg-red-650 hover:bg-red-700 text-white font-semibold font-mono text-xs py-2.5 px-6 rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Document Type Switcher */}
                <div className="bg-zinc-950 p-1 rounded-lg border border-zinc-850/60 flex gap-2">
                  <button
                    onClick={() => setDocType('orçamento')}
                    className={`flex-1 font-mono text-[10px] font-bold uppercase py-2 rounded-md transition-all cursor-pointer ${
                      docType === 'orçamento'
                        ? 'bg-red-650 text-white shadow'
                        : 'text-zinc-400 hover:text-white bg-transparent'
                    }`}
                  >
                    1. Visualizar Orçamento
                  </button>
                  <button
                    onClick={() => setDocType('recibo')}
                    className={`flex-1 font-mono text-[10px] font-bold uppercase py-2 rounded-md transition-all cursor-pointer ${
                      docType === 'recibo'
                        ? 'bg-red-650 text-white shadow'
                        : 'text-zinc-400 hover:text-white bg-transparent'
                    }`}
                  >
                    2. Visualizar Recibo
                  </button>
                </div>

                {/* Quick Status updates */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Estágio de Manutenção do Veículo</span>
                  <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
                    {[
                      { key: 'diagnostico', label: 'Laudo' },
                      { key: 'aguardando_pecas', label: 'Aguard. Peça' },
                      { key: 'execucao', label: 'Mecânica' },
                      { key: 'pronto', label: 'Pronto' },
                      { key: 'entregue', label: 'Entregue' }
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => handleUpdateStatus(selectedOrder.id, st.key as ServiceOrder['status'])}
                        className={`font-mono text-[8px] py-1.5 rounded uppercase font-bold text-center transition-all cursor-pointer ${
                          selectedOrder.status === st.key 
                            ? 'bg-red-650 text-white' 
                            : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Printed proposal */}
                <div id="proposal-print-area" className="bg-zinc-950 border border-zinc-850 p-5 rounded-lg space-y-4 font-mono text-xs border-l-2 border-l-red-500">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <div>
                      <p className="font-bold text-white">MC AUTOMECÂNICA & PERFORMANCE</p>
                      <p className="text-[9px] text-zinc-500">CNPJ: 45.109.844/0001-92 • Fone: (11) 98765-4321</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500 uppercase tracking-widest">{docType === 'orçamento' ? 'ORÇAMENTO' : 'RECIBO DE SERVIÇO'}</p>
                      <p className="text-[9px] text-zinc-500">REF: {selectedOrder.id}</p>
                    </div>
                  </div>

                  {/* Client & Car specifications */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-zinc-850 pb-3">
                    <div>
                      <span className="text-zinc-550 block">CLIENTE:</span>
                      <span className="text-white block font-sans font-bold">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-550 block">VEÍCULO & PLACA:</span>
                      <span className="text-white block">{selectedOrder.vehicleBrand} {selectedOrder.vehicleModel}</span>
                      <span className="text-red-500 font-bold block mt-0.5">{selectedOrder.vehiclePlate}</span>
                    </div>
                  </div>

                  {/* Items Table details */}
                  <div className="space-y-2">
                    <span className="text-zinc-500 text-[9px] uppercase block pb-1 border-b border-zinc-850">
                      {docType === 'orçamento' ? 'Itens de Reparo & Orçamento Estimado' : 'Discriminativo de Itens de Serviço Concluídos'}
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-zinc-300">
                          <span>{it.quantity}x {it.description}</span>
                          <span>{formatBRL(it.price * it.quantity)}</span>
                        </div>
                      ))}
                      {selectedOrder.items.length === 0 && (
                        <p className="text-center text-zinc-500 text-[10px]">Nenhuma especificação cadastrada.</p>
                      )}
                    </div>
                  </div>

                  {/* Document footer & total */}
                  <div className="border-t border-zinc-850 pt-3 flex justify-between items-center text-xs font-bold font-mono">
                    <span className="text-zinc-500">
                      {docType === 'orçamento' ? 'ESTIMATIVA TOTAL:' : 'TOTAL QUITADO:'}
                    </span>
                    <span className="text-red-500 text-sm font-black">{formatBRL(selectedOrder.totalValue)}</span>
                  </div>

                  {/* Legal Terms representation */}
                  <div className="text-[8px] leading-relaxed text-zinc-500 pt-2 border-t border-zinc-900 border-dashed">
                    {docType === 'orçamento' ? (
                      <p>* Validade da proposta: 10 dias. O início dos trabalhos dependerá da assinatura de concordância por parte do proprietário. Garantia legal aplicada de 90 dias.</p>
                    ) : (
                      <p>* Declaração de quitação de serviço. Veículo liberado para tráfego sob termo padrão de satisfação e garantia operacional regular de 90 dias.</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-1 text-xs">
                    <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-wider block">Observações Técnicas Operacionais</span>
                    <p className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-300 leading-relaxed text-left">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Export capabilities & PDF Simulation buttons */}
                <div className="space-y-2 pt-2">
                  <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-wider block">Exportar & Enviar ao Cliente</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => handleDownloadPdf(selectedOrder, docType)}
                      className="bg-red-600 hover:bg-red-700 font-sans text-xs text-white font-bold py-3 px-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 duration-100"
                    >
                      <FileDown className="w-4 h-4 text-white" />
                      Gerar PDF Oficial
                    </button>

                    <button
                      onClick={() => handleCopyToClipboard(selectedOrder, docType)}
                      className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-red-550/50 font-mono text-xs text-white py-3 px-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-red-500" />
                          Enviar p/ WhatsApp
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadTxt(selectedOrder, docType)}
                      className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-red-550/30 font-mono text-xs text-zinc-400 hover:text-white py-3 px-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Texto (.TXT)
                    </button>
                  </div>
                </div>

                {/* Close of screen actions and window print triggers */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-850 gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(selectedOrder)}
                      className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-white font-mono text-xs px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase"
                    >
                      <Pencil className="w-3.5 h-3.5 text-red-500" /> Editar Peças
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOrderToDelete(selectedOrder); setSelectedOrder(null); }}
                      className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-mono text-xs px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer uppercase"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" /> Excluir OS
                    </button>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => window.print()}
                      className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-500 font-mono text-xs text-white px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-red-500" /> Imprimir
                    </button>

                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="bg-red-650 hover:bg-red-700 text-white font-semibold font-mono text-xs py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG / MODAL */}
      {orderToDelete && (
        <div id="delete-order-dialog" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-55 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-sm tracking-tight text-white uppercase font-sans">Excluir Ordem de Serviço</h4>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Você tem certeza de que deseja remover a O.S. <strong className="text-white font-mono">{orderToDelete.id}</strong> do cliente <span className="text-white font-semibold">{orderToDelete.customerName}</span>? Esta ação é irreversível e removerá todos os itens e históricos associados.
            </p>

            <div className="flex gap-2.5 justify-end font-mono text-xs pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="bg-transparent hover:bg-zinc-850 text-zinc-400 hover:text-white px-4 py-2 rounded transition-all cursor-pointer"
              >
                Cancelar Exclusão
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
                  setOrderToDelete(null);
                }}
                className="bg-red-650 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded transition-all cursor-pointer"
              >
                Sim, Excluir O.S.
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
