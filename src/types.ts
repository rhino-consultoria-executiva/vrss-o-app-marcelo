export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  status: 'VIP' | 'ATIVO' | 'INATIVO';
  avatarText: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  joinDate: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  description: string;
  category: 'Diagnóstico' | 'Tuning' | 'Revisão' | 'Manutenção' | 'Upgrade';
  value: number | ''; // can be null/undefined or empty for "A definir"
  priority: 'URGENTE' | 'ALTA' | 'NORMAL';
  stage: string;
  dateCreated: string;
  aiDiagnosis?: string; // Optional AI-generated proposal details
}

export interface FunnelStage {
  id: string;
  title: string;
  color: string;
}

export interface ServiceOrderItem {
  description: string;
  quantity: number;
  price: number;
}

export interface ServiceOrder {
  id: string;
  customerId: string;
  customerName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePlate: string;
  description: string;
  status: 'diagnostico' | 'aguardando_pecas' | 'execucao' | 'pronto' | 'entregue' | 'aguardando' | 'finalizado' | 'cancelado';
  totalValue: number;
  items: ServiceOrderItem[];
  dateCreated: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Peças de Reposição' | 'Performance' | 'Lubrificantes' | 'Pneus' | 'Eletrônica';
  sku: string;
  quantity: number;
  price: number;
  compatibilities: string[];
  minStock: number;
}

export interface DashboardStats {
  totalRevenue: number;
  activeOrdersCount: number;
  averageTicket: number;
  pendingLeadsCount: number;
}
