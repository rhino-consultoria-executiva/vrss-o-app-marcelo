import { Customer, Lead, ServiceOrder, InventoryItem, FunnelStage } from './types';

// -------------------------------------------------------------
// LOCAL STORAGE KEYS
// -------------------------------------------------------------
const KEYS = {
    customers: 'mc_crm_customers',
    leads: 'mc_crm_leads',
    serviceOrders: 'mc_crm_service_orders',
    inventory: 'mc_crm_inventory',
    funnelStages: 'mc_crm_funnel_stages',
};

// -------------------------------------------------------------
// HELPERS
// -------------------------------------------------------------
function loadFromStorage<T>(key: string): T[] {
    try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : [];
    } catch {
          return [];
    }
}

function saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
}

// -------------------------------------------------------------
// DATABASE PERSISTENCE LAYER (localStorage)
// -------------------------------------------------------------
export const dbService = {
    // --- Customers ---
    async getCustomers(): Promise<Customer[]> {
          return loadFromStorage<Customer>(KEYS.customers);
    },

    async upsertCustomer(customer: Customer): Promise<void> {
          const all = loadFromStorage<Customer>(KEYS.customers);
          const idx = all.findIndex(c => c.id === customer.id);
          if (idx >= 0) all[idx] = customer;
          else all.push(customer);
          saveToStorage(KEYS.customers, all);
    },

    async deleteCustomer(id: string): Promise<void> {
          const all = loadFromStorage<Customer>(KEYS.customers).filter(c => c.id !== id);
          saveToStorage(KEYS.customers, all);
    },

    // --- Leads (Funnel) ---
    async getLeads(): Promise<Lead[]> {
          return loadFromStorage<Lead>(KEYS.leads);
    },

    async upsertLead(lead: Lead): Promise<void> {
          const all = loadFromStorage<Lead>(KEYS.leads);
          const idx = all.findIndex(l => l.id === lead.id);
          if (idx >= 0) all[idx] = lead;
          else all.push(lead);
          saveToStorage(KEYS.leads, all);
    },

    async deleteLead(id: string): Promise<void> {
          const all = loadFromStorage<Lead>(KEYS.leads).filter(l => l.id !== id);
          saveToStorage(KEYS.leads, all);
    },

    // --- Service Orders ---
    async getServiceOrders(): Promise<ServiceOrder[]> {
          return loadFromStorage<ServiceOrder>(KEYS.serviceOrders);
    },

    async upsertServiceOrder(order: ServiceOrder): Promise<void> {
          const all = loadFromStorage<ServiceOrder>(KEYS.serviceOrders);
          const idx = all.findIndex(o => o.id === order.id);
          if (idx >= 0) all[idx] = order;
          else all.push(order);
          saveToStorage(KEYS.serviceOrders, all);
    },

    async deleteServiceOrder(id: string): Promise<void> {
          const all = loadFromStorage<ServiceOrder>(KEYS.serviceOrders).filter(o => o.id !== id);
          saveToStorage(KEYS.serviceOrders, all);
    },

    // --- Inventory ---
    async getInventory(): Promise<InventoryItem[]> {
          return loadFromStorage<InventoryItem>(KEYS.inventory);
    },

    async upsertInventoryItem(item: InventoryItem): Promise<void> {
          const all = loadFromStorage<InventoryItem>(KEYS.inventory);
          const idx = all.findIndex(i => i.id === item.id);
          if (idx >= 0) all[idx] = item;
          else all.push(item);
          saveToStorage(KEYS.inventory, all);
    },

    async deleteInventoryItem(id: string): Promise<void> {
          const all = loadFromStorage<InventoryItem>(KEYS.inventory).filter(i => i.id !== id);
          saveToStorage(KEYS.inventory, all);
    },

    // --- Funnel Stages ---
    async getFunnelStages(): Promise<FunnelStage[]> {
          return loadFromStorage<FunnelStage>(KEYS.funnelStages);
    },

    async upsertFunnelStage(stage: FunnelStage, _position: number): Promise<void> {
          const all = loadFromStorage<FunnelStage>(KEYS.funnelStages);
          const idx = all.findIndex(s => s.id === stage.id);
          if (idx >= 0) all[idx] = stage;
          else all.push(stage);
          saveToStorage(KEYS.funnelStages, all);
    },

    async deleteFunnelStage(id: string): Promise<void> {
          const all = loadFromStorage<FunnelStage>(KEYS.funnelStages).filter(s => s.id !== id);
          saveToStorage(KEYS.funnelStages, all);
    },
};
