import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import SalesFunnelView from './components/SalesFunnelView';
import CustomerBaseView from './components/CustomerBaseView';
import ServiceHistoryView from './components/ServiceHistoryView';
import InventoryView from './components/InventoryView';
import ReportsView from './components/ReportsView';
import LoginView from './components/LoginView';

// Modal imports
import ServiceOrderModal from './components/ServiceOrderModal';
import CustomerModal from './components/CustomerModal';

// Mock data presets
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_LEADS, 
  INITIAL_SERVICE_ORDERS, 
  INITIAL_INVENTORY 
} from './data/mockData';
import { Customer, Lead, ServiceOrder, InventoryItem } from './types';
import { HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { dbService, isSupabaseConfigured } from './supabase';

export default function App() {
  // Authentication states backed by localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mc_crm_authenticated') === 'true';
  });
  const [activeUser, setActiveUser] = useState<string>(() => {
    const cached = localStorage.getItem('mc_crm_username') || 'Marcelo';
    return cached.includes('@') ? cached.split('@')[0] : cached;
  });

  // Navigation Section States matching Sidebar expectations
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  
  // Secondary sub-tab states matching Navbar funnel section expectations
  const [activeTab, setActiveTab] = useState<string>('leads');

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');

  // Toast confirmation feedback message state
  const [appToast, setAppToast] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('mc_crm_authenticated');
    localStorage.removeItem('mc_crm_username');
    setIsAuthenticated(false);
    setActiveUser('Marcelo');
    setAppToast('Log out realizado');
    setTimeout(() => setAppToast(null), 3000);
  };

  const handleLoginSuccess = (user: string) => {
    setIsAuthenticated(true);
    const displayName = user.includes('@') ? user.split('@')[0] : user;
    setActiveUser(displayName);
    setAppToast(`Bem-vindo, ${displayName}!`);
    setTimeout(() => setAppToast(null), 4000);
  };

  // Primary CRM DB State
  const [customers, setCustomersRaw] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [leads, setLeadsRaw] = useState<Lead[]>(INITIAL_LEADS);
  const [serviceOrders, setServiceOrdersRaw] = useState<ServiceOrder[]>(INITIAL_SERVICE_ORDERS);
  const [inventory, setInventoryRaw] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // Synchronization tracks and configs
  const [dbSource, setDbSource] = useState<'Supabase' | 'LocalStorage'>('LocalStorage');
  const isInitialLoadCompleted = useRef(false);

  // Delta syncer callbacks
  const syncCustomersToSupabase = async (prev: Customer[], next: Customer[]) => {
    try {
      const nextIds = new Set(next.map(c => c.id));
      const deleted = prev.filter(c => !nextIds.has(c.id));
      for (const c of deleted) {
        await dbService.deleteCustomer(c.id);
      }
      const prevMap = new Map(prev.map(c => [c.id, c]));
      const toUpsert = next.filter(c => {
        const prevC = prevMap.get(c.id);
        return !prevC || JSON.stringify(prevC) !== JSON.stringify(c);
      });
      for (const c of toUpsert) {
        await dbService.upsertCustomer(c);
      }
    } catch (e) {
      console.error('Erro ao sincronizar clientes:', e);
    }
  };

  const syncLeadsToSupabase = async (prev: Lead[], next: Lead[]) => {
    try {
      const nextIds = new Set(next.map(l => l.id));
      const deleted = prev.filter(l => !nextIds.has(l.id));
      for (const l of deleted) {
        await dbService.deleteLead(l.id);
      }
      const prevMap = new Map(prev.map(l => [l.id, l]));
      const toUpsert = next.filter(l => {
        const prevL = prevMap.get(l.id);
        return !prevL || JSON.stringify(prevL) !== JSON.stringify(l);
      });
      for (const l of toUpsert) {
        await dbService.upsertLead(l);
      }
    } catch (e) {
      console.error('Erro ao sincronizar leads:', e);
    }
  };

  const syncServiceOrdersToSupabase = async (prev: ServiceOrder[], next: ServiceOrder[]) => {
    try {
      const nextIds = new Set(next.map(o => o.id));
      const deleted = prev.filter(o => !nextIds.has(o.id));
      for (const o of deleted) {
        await dbService.deleteServiceOrder(o.id);
      }
      const prevMap = new Map(prev.map(o => [o.id, o]));
      const toUpsert = next.filter(o => {
        const prevO = prevMap.get(o.id);
        return !prevO || JSON.stringify(prevO) !== JSON.stringify(o);
      });
      for (const o of toUpsert) {
        await dbService.upsertServiceOrder(o);
      }
    } catch (e) {
      console.error('Erro ao sincronizar ordens de serviço:', e);
    }
  };

  const syncInventoryToSupabase = async (prev: InventoryItem[], next: InventoryItem[]) => {
    try {
      const nextIds = new Set(next.map(i => i.id));
      const deleted = prev.filter(i => !nextIds.has(i.id));
      for (const i of deleted) {
        await dbService.deleteInventoryItem(i.id);
      }
      const prevMap = new Map(prev.map(i => [i.id, i]));
      const toUpsert = next.filter(i => {
        const prevI = prevMap.get(i.id);
        return !prevI || JSON.stringify(prevI) !== JSON.stringify(i);
      });
      for (const i of toUpsert) {
        await dbService.upsertInventoryItem(i);
      }
    } catch (e) {
      console.error('Erro ao sincronizar estoque:', e);
    }
  };

  // Intercepting setters matching standard dispatch hooks
  const setCustomers = (val: React.SetStateAction<Customer[]>) => {
    setCustomersRaw(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('mc_crm_customers', JSON.stringify(nextVal));
      if (isSupabaseConfigured() && isInitialLoadCompleted.current) {
        syncCustomersToSupabase(prev, nextVal);
      }
      return nextVal;
    });
  };

  const setLeads = (val: React.SetStateAction<Lead[]>) => {
    setLeadsRaw(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('mc_crm_leads', JSON.stringify(nextVal));
      if (isSupabaseConfigured() && isInitialLoadCompleted.current) {
        syncLeadsToSupabase(prev, nextVal);
      }
      return nextVal;
    });
  };

  const setServiceOrders = (val: React.SetStateAction<ServiceOrder[]>) => {
    setServiceOrdersRaw(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('mc_crm_service_orders', JSON.stringify(nextVal));
      if (isSupabaseConfigured() && isInitialLoadCompleted.current) {
        syncServiceOrdersToSupabase(prev, nextVal);
      }
      return nextVal;
    });
  };

  const setInventory = (val: React.SetStateAction<InventoryItem[]>) => {
    setInventoryRaw(prev => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('mc_crm_inventory', JSON.stringify(nextVal));
      if (isSupabaseConfigured() && isInitialLoadCompleted.current) {
        syncInventoryToSupabase(prev, nextVal);
      }
      return nextVal;
    });
  };

  // Initial loader effect running on mount / authentication changes
  useEffect(() => {
    async function loadCrmData() {
      if (isSupabaseConfigured()) {
        try {
          const cloudCust = await dbService.getCustomers();
          const cloudLeads = await dbService.getLeads();
          const cloudOrders = await dbService.getServiceOrders();
          const cloudInv = await dbService.getInventory();

          setCustomersRaw(cloudCust);
          setLeadsRaw(cloudLeads);
          setServiceOrdersRaw(cloudOrders);
          setInventoryRaw(cloudInv);
          setDbSource('Supabase');

          // Hot backup local storage syncing
          localStorage.setItem('mc_crm_customers', JSON.stringify(cloudCust));
          localStorage.setItem('mc_crm_leads', JSON.stringify(cloudLeads));
          localStorage.setItem('mc_crm_service_orders', JSON.stringify(cloudOrders));
          localStorage.setItem('mc_crm_inventory', JSON.stringify(cloudInv));
        } catch (e) {
          console.warn('Supabase offline or table missing, using localStorage fallback. Err:', e);
          loadFromLocalStorage();
        } finally {
          isInitialLoadCompleted.current = true;
        }
      } else {
        loadFromLocalStorage();
        isInitialLoadCompleted.current = true;
      }
    }

    function loadFromLocalStorage() {
      setDbSource('LocalStorage');
      const cachedCust = localStorage.getItem('mc_crm_customers');
      const cachedLeads = localStorage.getItem('mc_crm_leads');
      const cachedOrders = localStorage.getItem('mc_crm_service_orders');
      const cachedInv = localStorage.getItem('mc_crm_inventory');

      if (cachedCust) setCustomersRaw(JSON.parse(cachedCust));
      else {
        setCustomersRaw(INITIAL_CUSTOMERS);
        localStorage.setItem('mc_crm_customers', JSON.stringify(INITIAL_CUSTOMERS));
      }

      if (cachedLeads) setLeadsRaw(JSON.parse(cachedLeads));
      else {
        setLeadsRaw(INITIAL_LEADS);
        localStorage.setItem('mc_crm_leads', JSON.stringify(INITIAL_LEADS));
      }

      if (cachedOrders) setServiceOrdersRaw(JSON.parse(cachedOrders));
      else {
        setServiceOrdersRaw(INITIAL_SERVICE_ORDERS);
        localStorage.setItem('mc_crm_service_orders', JSON.stringify(INITIAL_SERVICE_ORDERS));
      }

      if (cachedInv) setInventoryRaw(JSON.parse(cachedInv));
      else {
        setInventoryRaw(INITIAL_INVENTORY);
        localStorage.setItem('mc_crm_inventory', JSON.stringify(INITIAL_INVENTORY));
      }
    }

    if (isAuthenticated) {
      loadCrmData();
    }
  }, [isAuthenticated]);

  // List of vehicle brands in the workshop system (Most common performance/general brands)
  const [brandsList, setBrandsList] = useState<string[]>(() => {
    const defaultBrands = [
      'BMW', 'Porsche', 'Audi', 'Mercedes-Benz', 'VW', 
      'Ford', 'Ferrari', 'Chevrolet', 'Fiat', 'Toyota', 
      'Honda', 'Hyundai', 'Jeep', 'Renault', 'Peugeot'
    ];
    const customerBrands = INITIAL_CUSTOMERS.map(c => c.vehicleBrand);
    // Unique list, sorted alphabetically
    return Array.from(new Set([...defaultBrands, ...customerBrands])).sort();
  });

  // Modal open states
  const [isOSModalOpen, setIsOSModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  // Mobile sidebar drawer open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lead Conversion Auto Engine: When status arrows push Lead to approved, generate Service Order instantly!
  const handleApproveLeadToServiceOrder = (lead: Lead) => {
    // Check if duplicate prevention exists 
    const alreadyExists = serviceOrders.some(order => order.notes?.includes(lead.id));
    if (alreadyExists) return;

    const generatedId = `OS-AUTO-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const agreedPrice = lead.value && Number(lead.value) > 0 ? Number(lead.value) : 1200.00;

    const autoCostItem = {
      description: `Projeto aprovado no funil: ${lead.category} (${lead.description})`,
      quantity: 1,
      price: agreedPrice
    };

    const newOS: ServiceOrder = {
      id: generatedId,
      customerId: `CUST-AUTO-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: lead.name,
      vehicleBrand: lead.vehicleBrand,
      vehicleModel: lead.vehicleModel,
      vehiclePlate: lead.vehiclePlate || 'ABC-1234',
      description: `Upgrade de performance / Diagnóstico do funil (${lead.category})`,
      status: 'execucao', // puts immediately into action status
      totalValue: agreedPrice,
      items: [autoCostItem],
      dateCreated: new Date().toISOString().split('T')[0],
      notes: `Conversão automática de Oportunidade Ref: ${lead.id}. ${lead.description}`
    };

    // Update state lists
    setServiceOrders(prev => [newOS, ...prev]);

    // Check if customer exists, increment billing or create new profile
    setCustomers(prevCust => {
      const alreadyPresent = prevCust.find(c => c.name.toLowerCase() === lead.name.toLowerCase());
      if (alreadyPresent) {
        return prevCust.map(c => c.id === alreadyPresent.id 
          ? { ...c, totalSpent: c.totalSpent + agreedPrice, status: 'VIP' } 
          : c
        );
      } else {
        const initials = lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const randId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        const freshCustomer: Customer = {
          id: randId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          totalSpent: agreedPrice,
          status: 'ATIVO',
          avatarText: initials,
          vehicleBrand: lead.vehicleBrand,
          vehicleModel: lead.vehicleModel,
          vehicleYear: lead.vehicleYear,
          vehiclePlate: lead.vehiclePlate || 'ABC-1234',
          joinDate: new Date().toISOString().split('T')[0]
        };
        return [freshCustomer, ...prevCust];
      }
    });

    setAppToast(`Auto-OS: Lead "${lead.name}" promovido para OS ${generatedId}!`);
    setTimeout(() => setAppToast(null), 4000);
  };

  // Compute live unread alerts
  const lowStockCount = inventory.filter(i => i.quantity <= i.minStock).length;
  const urgentLeadsCount = leads.filter(l => l.priority === 'URGENTE' && l.stage !== 'approved').length;
  const liveNotificationCount = lowStockCount + urgentLeadsCount;

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex bg-zinc-950 min-h-screen text-zinc-100 overflow-x-hidden font-sans select-none antialiased">
      
      {/* Visual Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        onNewOrderClick={() => {
          setIsOSModalOpen(true);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Frame details layout */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        
        {/* Top control header bar */}
        <Navbar 
          activeSection={activeSection}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setActiveSection={setActiveSection}
          onAddCustomerClick={() => setIsCustomerModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationCount={liveNotificationCount || 3}
          toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          activeUser={activeUser}
        />

        {/* Dynamic page mount routing */}
        <main className="flex-1">
          {activeSection === 'dashboard' && (
            <DashboardView 
              customers={customers}
              leads={leads}
              serviceOrders={serviceOrders}
              inventory={inventory}
              setActiveSection={setActiveSection}
              setActiveTab={setActiveTab}
            />
          )}

          {activeSection === 'funnel' && activeTab === 'leads' && (
            <SalesFunnelView 
              leads={leads}
              setLeads={setLeads}
              customers={customers}
              setCustomers={setCustomers}
              onApproveLeadToServiceOrder={handleApproveLeadToServiceOrder}
            />
          )}

          {activeSection === 'funnel' && activeTab === 'active_jobs' && (
            <ServiceHistoryView 
              serviceOrders={serviceOrders}
              setServiceOrders={setServiceOrders}
            />
          )}

          {activeSection === 'funnel' && activeTab === 'inventory' && (
            <InventoryView 
              inventory={inventory}
              setInventory={setInventory}
              searchQuery={searchQuery}
            />
          )}

          {activeSection === 'customers' && (
            <CustomerBaseView 
              customers={customers}
              setCustomers={setCustomers}
              searchQuery={searchQuery}
              brandsList={brandsList}
              setBrandsList={setBrandsList}
              leads={leads}
              setLeads={setLeads}
            />
          )}

          {activeSection === 'history' && (
            <ServiceHistoryView 
              serviceOrders={serviceOrders}
              setServiceOrders={setServiceOrders}
            />
          )}

          {activeSection === 'inventory' && (
            <InventoryView 
              inventory={inventory}
              setInventory={setInventory}
              searchQuery={searchQuery}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsView 
              serviceOrders={serviceOrders}
              customers={customers}
            />
          )}

          {/* Central Utilities Support section */}
          {activeSection === 'support' && (
            <div className="p-8 max-w-2xl text-left space-y-6">
              <h2 className="text-xl font-semibold text-white tracking-tight">Suporte Técnico Interno</h2>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                <HelpCircle className="w-8 h-8 text-red-500" />
                <p className="text-sm leading-relaxed text-zinc-300">MC Automecânica CRM está operando via contêineres Cloud na infraestrutura segura. Caso tenha alguma dúvida ou falha com o sistema, entre em contato com seu administrador de sistema local.</p>
                <div className="font-mono text-[11px] text-zinc-500 space-y-1">
                  <p>SERVIDOR API: <span className="text-emerald-400">Ativo</span></p>
                  <p>TELEMETRIA DA OFICINA: <span className="text-emerald-400">Operante</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Settings Panel */}
          {activeSection === 'settings' && (
            <div className="p-8 max-w-2xl text-left space-y-6">
              <h2 className="text-xl font-semibold text-white tracking-tight">Configurações Base do CRM</h2>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <p className="text-sm text-white font-bold uppercase tracking-wider">SISTEMA INTEGRADO OPERANTE</p>
                </div>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-800">
                    <span>Conversão Automática de Leads em O.S.</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> ATIVO</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-800">
                    <span>Notificações Sonoras de Alertas no Pátio</span>
                    <span className="text-zinc-500">Desativado</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-zinc-800">
                    <span>Banco de Dados Principal</span>
                    <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${
                      dbSource === 'Supabase' 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-950/40 text-amber-500 border-amber-500/20'
                    }`}>
                      {dbSource === 'Supabase' ? 'Supabase Cloud (Ativo)' : 'LocalStorage Offline'}
                    </span>
                  </div>
                </div>

                {dbSource === 'LocalStorage' && (
                  <div className="bg-zinc-950/55 border border-amber-500/10 p-5 rounded-xl space-y-2.5 mt-3 animate-fade-in text-left">
                    <p className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Banco de Dados Local Ativo
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      O sistema vem preparado com suporte nativo e migrações SQL completas para <strong>Supabase (PostgreSQL)</strong>. No momento, o app está operando em modo offline persistindo dados diretamente no navegador via <code className="text-zinc-300 font-mono bg-zinc-900 px-1 py-0.5 rounded">localStorage</code> para que você não perca seu trabalho.
                    </p>
                    <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-850 space-y-1.5 font-mono text-[10px] text-zinc-500 mt-2">
                      <p className="text-zinc-400 font-bold">Como Conectar seu Supabase Cloud:</p>
                      <p>1. Crie um projeto no Supabase e execute as migrações em <code className="text-zinc-300 font-sans">/supabase/migrations/</code></p>
                      <p>2. Configure as seguintes chaves nas variáveis de ambiente do projeto (.env):</p>
                      <p className="pl-3 text-white">VITE_SUPABASE_URL= &quot;sua-url-do-supabase&quot;</p>
                      <p className="pl-3 text-white">VITE_SUPABASE_ANON_KEY= &quot;sua-chave-anon-key&quot;</p>
                    </div>
                  </div>
                )}

                {dbSource === 'Supabase' && (
                  <div className="bg-zinc-950/55 border border-emerald-500/10 p-5 rounded-xl space-y-2.5 mt-3 animate-fade-in text-left">
                    <p className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Conexão em Nuvem Estabelecida!
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Todas as inserções, remoções e alterações de Clientes, Oportunidades (Leads), Ordens de Serviço e Peças no Estoque estão sendo persistidas e sincronizadas em tempo real no seu banco de dados PostgreSQL hospedado no Supabase Cloud.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* REGISTER SERVICE ORDER REGISTRATION MODAL */}
      <ServiceOrderModal
        isOpen={isOSModalOpen}
        onClose={() => setIsOSModalOpen(false)}
        customers={customers}
        setCustomers={setCustomers}
        serviceOrders={serviceOrders}
        setServiceOrders={setServiceOrders}
      />

      {/* REGISTER CUSTOMER DETAILS MODAL */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        setCustomers={setCustomers}
        customers={customers}
        brandsList={brandsList}
        setBrandsList={setBrandsList}
      />

      {appToast && (
        <div className="fixed bottom-6 left-6 md:left-auto md:right-6 bg-zinc-900 border-l-4 border-red-500 border-zinc-800 rounded-xl p-4 shadow-2xl flex items-center gap-3 z-50 animate-bounce max-w-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">{appToast}</span>
        </div>
      )}

    </div>
  );
}
