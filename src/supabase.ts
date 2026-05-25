import { createClient } from '@supabase/supabase-js';
import { Customer, Lead, ServiceOrder, InventoryItem, FunnelStage } from './types';

export const getSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('custom_supabase_url');
    if (localUrl && (localUrl.includes('ypnqbeakaqyvmxechyte') || localUrl.includes('demoprj'))) {
      localStorage.removeItem('custom_supabase_url');
      localStorage.removeItem('custom_supabase_anon_key');
    }
  }

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_anon_key') : null;
  
  const url = localUrl || (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.NEXT_PUBLIC_SUPABASE_URL || 'https://qwniodqdhhzbobbupxyf.supabase.co';
  const key = localKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 
              (import.meta as any).env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
              (import.meta as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_EVFWUO3G2GuY6iFy8lk9Kw_jIMSs4Y2';
  return { url: url.trim(), key: key.trim() };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return !!url && !!key && url.trim() !== '' && key.trim() !== '';
};

// Lazy instance holder
let supabaseInstance: any = null;

export const supabase = isSupabaseConfigured() 
  ? createClient(getSupabaseConfig().url, getSupabaseConfig().key) 
  : null;

// Helper to get client or trigger fallback alert safely
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseConfig();
  if (!supabaseInstance || (supabaseInstance as any).supabaseUrl !== url || (supabaseInstance as any).supabaseKey !== key) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

export const saveCustomSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('custom_supabase_url', url.trim());
    } else {
      localStorage.removeItem('custom_supabase_url');
    }
    
    if (key.trim()) {
      localStorage.setItem('custom_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('custom_supabase_anon_key');
    }
  }
  supabaseInstance = null;
};

export const clearCustomSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('custom_supabase_url');
    localStorage.removeItem('custom_supabase_anon_key');
  }
  supabaseInstance = null;
};

// -------------------------------------------------------------
// DATA TRANSLATORS (JS camelCase <=> PostgreSQL snake_case)
// -------------------------------------------------------------

export const mapCustomerFromDb = (db: any): Customer => ({
  id: db.id,
  name: db.name,
  email: db.email || '',
  phone: db.phone || '',
  totalSpent: parseFloat(db.total_spent) || 0,
  status: db.status || 'ATIVO',
  avatarText: db.avatar_text || db.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
  vehicleBrand: db.vehicle_brand || '',
  vehicleModel: db.vehicle_model || '',
  vehicleYear: db.vehicle_year || new Date().getFullYear(),
  vehiclePlate: db.vehicle_plate || '',
  joinDate: db.join_date || new Date().toISOString().split('T')[0],
});

export const mapCustomerToDb = (c: Customer) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  total_spent: c.totalSpent,
  status: c.status,
  avatar_text: c.avatarText,
  vehicle_brand: c.vehicleBrand,
  vehicle_model: c.vehicleModel,
  vehicle_year: c.vehicleYear,
  vehicle_plate: c.vehiclePlate,
  join_date: c.joinDate,
});

export const mapLeadFromDb = (db: any): Lead => ({
  id: db.id,
  name: db.name,
  email: db.email || '',
  phone: db.phone || '',
  vehicleBrand: db.vehicle_brand || '',
  vehicleModel: db.vehicle_model || '',
  vehicleYear: db.vehicle_year || new Date().getFullYear(),
  vehiclePlate: db.vehicle_plate || '',
  description: db.description || '',
  category: db.category || 'Manutenção',
  value: db.value !== null && db.value !== undefined ? parseFloat(db.value) : '',
  priority: db.priority || 'NORMAL',
  stage: db.stage || 'leads',
  dateCreated: db.date_created || new Date().toISOString(),
  aiDiagnosis: db.ai_diagnosis || undefined,
});

export const mapLeadToDb = (l: Lead) => ({
  id: l.id,
  name: l.name,
  email: l.email,
  phone: l.phone,
  vehicle_brand: l.vehicleBrand,
  vehicle_model: l.vehicleModel,
  vehicle_year: l.vehicleYear,
  vehicle_plate: l.vehiclePlate,
  description: l.description,
  category: l.category,
  value: l.value === '' ? null : l.value,
  priority: l.priority,
  stage: l.stage,
  date_created: l.dateCreated,
  ai_diagnosis: l.aiDiagnosis || null,
});

export const mapServiceOrderFromDb = (db: any): ServiceOrder => ({
  id: db.id,
  customerId: db.customer_id || '',
  customerName: db.customer_name || '',
  vehicleBrand: db.vehicle_brand || '',
  vehicleModel: db.vehicle_model || '',
  vehiclePlate: db.vehicle_plate || '',
  description: db.description || '',
  status: db.status || 'diagnostico',
  totalValue: parseFloat(db.total_value) || 0,
  items: Array.isArray(db.items) ? db.items : [],
  notes: db.notes || '',
  dateCreated: db.date_created || new Date().toISOString().split('T')[0],
});

export const mapServiceOrderToDb = (o: ServiceOrder) => ({
  id: o.id,
  customer_id: o.customerId || null,
  customer_name: o.customerName,
  vehicle_brand: o.vehicleBrand,
  vehicle_model: o.vehicleModel,
  vehicle_plate: o.vehiclePlate,
  description: o.description,
  status: o.status,
  total_value: o.totalValue,
  items: o.items,
  notes: o.notes,
  date_created: o.dateCreated,
});

export const mapInventoryFromDb = (db: any): InventoryItem => ({
  id: db.id,
  name: db.name,
  category: db.category || 'Peças de Reposição',
  sku: db.sku,
  quantity: db.quantity || 0,
  price: parseFloat(db.price) || 0,
  compatibilities: Array.isArray(db.compatibilities) ? db.compatibilities : [],
  minStock: db.min_stock || 0,
});

export const mapInventoryToDb = (i: InventoryItem) => ({
  id: i.id,
  name: i.name,
  category: i.category,
  sku: i.sku,
  quantity: i.quantity,
  price: i.price,
  compatibilities: i.compatibilities,
  min_stock: i.minStock,
});

// -------------------------------------------------------------
// DATABASE PERSISTENCE LAYER OPERATIONS
// -------------------------------------------------------------

export const dbService = {
  // --- Customers ---
  async getCustomers(): Promise<Customer[]> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');
    
    const { data, error } = await client
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    return (data || []).map(mapCustomerFromDb);
  },

  async upsertCustomer(customer: Customer): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const payload = mapCustomerToDb(customer);
    const { error } = await client
      .from('customers')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  },

  async deleteCustomer(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Leads (Funnel) ---
  async getLeads(): Promise<Lead[]> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client
      .from('leads')
      .select('*')
      .order('date_created', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapLeadFromDb);
  },

  async upsertLead(lead: Lead): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const payload = mapLeadToDb(lead);
    const { error } = await client
      .from('leads')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  },

  async deleteLead(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Service Orders ---
  async getServiceOrders(): Promise<ServiceOrder[]> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client
      .from('service_orders')
      .select('*')
      .order('date_created', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapServiceOrderFromDb);
  },

  async upsertServiceOrder(order: ServiceOrder): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const payload = mapServiceOrderToDb(order);
    const { error } = await client
      .from('service_orders')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  },

  async deleteServiceOrder(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('service_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Inventory ---
  async getInventory(): Promise<InventoryItem[]> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapInventoryFromDb);
  },

  async upsertInventoryItem(item: InventoryItem): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const payload = mapInventoryToDb(item);
    const { error } = await client
      .from('inventory')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- Funnel Stages ---
  async getFunnelStages(): Promise<FunnelStage[]> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { data, error } = await client
      .from('funnel_stages')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw error;
    return (data || []).map((db: any) => ({
      id: db.id,
      title: db.title,
      color: db.color
    }));
  },

  async upsertFunnelStage(stage: FunnelStage, position: number): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('funnel_stages')
      .upsert({
        id: stage.id,
        title: stage.title,
        color: stage.color,
        position
      }, { onConflict: 'id' });

    if (error) throw error;
  },

  async deleteFunnelStage(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { error } = await client
      .from('funnel_stages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
