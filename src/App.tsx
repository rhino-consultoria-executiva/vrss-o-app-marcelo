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
import { Customer, Lead, ServiceOrder, InventoryItem, FunnelStage } from './types';

const DEFAULT_FUNNEL_STAGES: FunnelStage[] = [
  { id: 'leads', title: 'Novo Lead', color: '#818cf8' },
  { id: 'quotes', title: 'OrÃ§amento Enviado', color: '#6366f1' },
  { id: 'negotiation', title: 'NegociaÃ§Ã£o', color: '#a5b4fc' },
  { id: 'approved', title: 'ServiÃ§o Aprovado', color: '#10b981' }
];
import { HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { dbService } from './supabase';

function deduplicateById<T extends { id: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter(item => {
    if (!item || !item.id) return false;
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

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
  const [funnelStages, setFunnelStagesRaw] = useState<FunnelStage[]>(DEFAULT_FUNNEL_STAGES);

  // Synchronization tracks and configs
  const isInitialLoadCompleted = useRef(false);

  // Delta syncer callbacks
  const syncCustomers = async (prev: Customer[], next: Customer[]) => {
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

  const syncLeads = async (prev: Lead[], next: Lead[]) => {
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

  const syncServiceOrders = async (prev: ServiceOrder[], next: ServiceOrder[]) => {
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
      console.error('Erro ao sincronizar ordens de serviÃ§o:', e);
    }
  };

  const syncInventory = async (prev: InventoryItem[], next: InventoryItem[]) => {
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
      const rawNext = typeof val === 'function' ? (val as any)(prev) : val;
      const nextVal = deduplicateById<Customer>(rawNext);
      localStorage.setItem('mc_crm_customers', JSON.stringify(nextVal));
      if (isInitialLoadCompleted.current) {
        syncCustomers(prev, nextVal);
      }
      return nextVal;
    });
  };

  const setLeads = (val: React.SetStateAction<Lead[]>) => {
    setLeadsRaw(prev => {
      const rawNext = typeof val === 'function' ? (val as any)(prev) : val;
      const nextVal = deduplicateById<Lead>(rawNext);
      localStorage.setItem('mc_crm_leads', JSON.stringify(nextVal));
      if (isInitialLoadCompleted.current) {
        syncLeads(prev, nextVal);
      }
      return nextVal;
    });
  };

  const setServiceOrders = (val: React.SetStateAction<ServiceOrder[]>) => {
    setServiceOrdersRaw(prev => {
      const rawNext = typeof val === 'function' ? (val as any)(prev) : val;
      const nextVal = deduplicateById<ServiceOrder>(rawNext);
      localStorage.setItem('mc_crm_service_orders', JSON.stringify(nextVal));
      if (isInitialLoadCompleted.current) {
        syncServiceOrders(prev, nextVal);
      }
      return nextVal;
    });
  };

  const setInventory = (val: React.SetStateAction<InventoryItem[]>) => {
    setInventoryRaw(prev => {
      const rawNext = typeof val === 'function' ? (val as any)(prev) : val;
      const nextVal = deduplicateById<InventoryItem>(rawNext);
      localStorage.setItem('mc_crm_inventory', JSON.stringify(nextVal));
      if (isInitialLoadCompleted.current) {
        syncInventory(prev, nextVal);
      }
      return nextVal;
    });
  };

  const syncFunnelStages = async (prev: FunnelStage[], next: FunnelStage[]) => {
    try {
      const nextIds = new Set(next.map(s => s.id));
      const deleted = prev.filter(s => !nextIds.has(s.id));
      for (const s of deleted) {
        try {
          await dbService.deleteFunnelStage(s.id);
        } catch (err) {
          console.warn('Erro ao deletar etapa, ignorando:', err);
        }
      }
      for (let i = 0; i < next.length; i++) {
        try {
          await dbService.upsertFunnelStage(next[i], i);
        } catch (err) {
          console.warn('Erro ao salvar etapa, ignorando:', err);
        }
      }
    } catch (e) {
      console.error('Erro geral ao sincronizar etapas do funil:', e);
    }
  };

  const setFunnelStages = (val: React.SetStateAction<FunnelStage[]>) => {
    setFunnelStagesRaw(prev => {
      const nextVal = typeof val === 'function' ? (val as any)(prev) : val;
      localStorage.setItem('mc_crm_funnel_stages', JSON.stringify(nextVal));
      if (isInitialLoadCompleted.current) {
        syncFunnelStages(prev, nextVal);
      }
      return nextVal;
    });
  };

  // Initial loader effect running on mount / authentication changes
  useEffect(() => {
    async function loadCrmData() {
      if (true) {
        try {
          const cloudCust = deduplicateById(await dbService.getCustomers());
          const cloudLeads = deduplicateById(await dbService.getLeads());
          const cloudOrders = deduplicateById(await dbService.getServiceOrders());
          const cloudInv = deduplicateById(await dbService.getInventory());

          // Load funnel stages
          let cloudStages: FunnelStage[] = [];
          try {
            cloudStages = await dbService.getFunnelStages();
          } catch (err) {
            console.warn('Tabela funnel_stages inacessÃ­vel ou vazia, usando backup local. Err:', err);
          }

          if (cloudStages.length === 0) {
            const cached = localStorage.getItem('mc_crm_funnel_stages');
            cloudStages = cached ? JSON.parse(cached) : DEFAULT_FUNNEL_STAGES;
            // Try saving defaults to cloud
            try {
              for (let i = 0; i < cloudStages.length; i++) {
                await dbService.upsertFunnelStage(cloudStages[i], i);
              }
            } catch (err) {
              console.warn('Falhou ao salvar stages padrÃ£o no cloud:', err);
            }
          }

          setCustomersRaw(cloudCust);
          setLeadsRaw(cloudLeads);
          setServiceOrdersRaw(cloudOrders);
          setInventoryRaw(cloudInv);
          setFunnelStagesRaw(cloudStages);
          setDbSource('localStorage');

          // Hot backup local storage syncing
          localStorage.setItem('mc_crm_customers', JSON.stringify(cloudCust));
          localStorage.setItem('mc_crm_leads', JSON.stringify(cloudLeads));
          localStorage.setItem('mc_crm_service_orders', JSON.stringify(cloudOrders));
          localStorage.setItem('mc_crm_inventory', JSON.stringify(cloudInv));
          localStorage.setItem('mc_crm_funnel_stages', JSON.stringify(cloudStages));
        } catch (e) {
          console.warn('Erro ao carregar dados do storage:', e);
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

      if (cachedCust) setCustomersRaw(deduplicateById(JSON.parse(cachedCust)));
      else {
        setCustomersRaw(INITIAL_CUSTOMERS);
        localStorage.setItem('mc_crm_customers', JSON.stringify(INITIAL_CUSTOMERS));
      }

      if (cachedLeads) setLeadsRaw(deduplicateById(JSON.parse(cachedLeads)));
      else {
        setLeadsRaw(INITIAL_LEADS);
        localStorage.setItem('mc_crm_leads', JSON.stringify(INITIAL_LEADS));
      }

      if (cachedOrders) setServiceOrdersRaw(deduplicateById(JSON.parse(cachedOrders)));
      else {
        setServiceOrdersRaw(INITIAL_SERVICE_ORDERS);
        localStorage.setItem('mc_crm_service_orders', JSON.stringify(INITIAL_SERVICE_ORDERS));
      }

      if (cachedInv) setInventoryRaw(deduplicateById(JSON.parse(cachedInv)));
      else {
        setInventoryRaw(INITIAL_INVENTORY);
        localStorage.setItem('mc_crm_inventory', JSON.stringify(INITIAL_INVENTORY));
      }

      const cachedStages = localStorage.getItem('mc_crm_funnel_stages');
      if (cachedStages) setFunnelStagesRaw(JSON.parse(cachedStages));
      else {
        setFunnelStagesRaw(DEFAULT_FUNNEL_STAGES);
        localStorage.setItem('mc_crm_funnel_stages', JSON.stringify(DEFAULT_FUNNEL_STAGES));
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
      description: `Upgrade de performance / DiagnÃ³stico do funil (${lead.category})`,
      status: 'execucao', // puts immediately into action status
      totalValue: agreedPrice,
      items: [autoCostItem],
      dateCreated: new Date().toISOString().split('T')[0],
      notes: `ConversÃ£o automÃ¡tica de Oportunidade Ref: ${lead.id}. ${lead.description}`
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
              funnelStages={funnelStages}
              setFunnelStages={setFunnelStages}
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
              funnelStages={funnelStages}
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
              setServiceOrders={setServiceOrders}
            />
          )}

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
