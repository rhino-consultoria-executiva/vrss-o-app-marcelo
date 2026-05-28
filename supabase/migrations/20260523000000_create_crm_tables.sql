-- Database Migration: Create CRM Tables for MC Automecânica & Performance
-- Target Database: Supabase (PostgreSQL)
-- File Location: /supabase/migrations/20260523000000_create_crm_tables.sql

-- Enable extension for UUIDs if not loaded (Supabase provides this naturally)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create automatic updated_at callback function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create CUSTOMERS Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  status TEXT CHECK (status IN ('VIP', 'ATIVO', 'INATIVO')) DEFAULT 'ATIVO',
  avatar_text TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_plate TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for customers list searches
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_plate ON customers(vehicle_plate);

-- Trigger for customer updating
DROP TRIGGER IF EXISTS set_timestamp_customers ON customers;
CREATE TRIGGER set_timestamp_customers
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- 3. Create LEADS Table (Sales Funnel)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_plate TEXT,
  description TEXT,
  category TEXT CHECK (category IN ('Diagnóstico', 'Tuning', 'Revisão', 'Manutenção', 'Upgrade')),
  value NUMERIC(12, 2),
  priority TEXT CHECK (priority IN ('URGENTE', 'ALTA', 'NORMAL')) DEFAULT 'NORMAL',
  stage TEXT DEFAULT 'leads',
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_diagnosis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for pipeline stages and speed
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);

DROP TRIGGER IF EXISTS set_timestamp_leads ON leads;
CREATE TRIGGER set_timestamp_leads
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- 4. Create SERVICE ORDERS Table
CREATE TABLE IF NOT EXISTS service_orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_plate TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('diagnostico', 'aguardando_pecas', 'execucao', 'pronto', 'entregue')) DEFAULT 'diagnostico',
  total_value NUMERIC(12, 2) DEFAULT 0.00,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_customer ON service_orders(customer_id);

DROP TRIGGER IF EXISTS set_timestamp_service_orders ON service_orders;
CREATE TRIGGER set_timestamp_service_orders
BEFORE UPDATE ON service_orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- 5. Create INVENTORY (STOCKS) Table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Peças de Reposição', 'Performance', 'Lubrificantes', 'Pneus', 'Eletrônica')),
  sku TEXT UNIQUE NOT NULL,
  quantity INTEGER DEFAULT 0,
  price NUMERIC(12, 2) DEFAULT 0.00,
  compatibilities TEXT[] DEFAULT '{}'::text[],
  min_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

DROP TRIGGER IF EXISTS set_timestamp_inventory ON inventory;
CREATE TRIGGER set_timestamp_inventory
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-----------------------------------------------------------
-- SEED DATA PRE-POPULATION (Matches current system state)
-----------------------------------------------------------

-- Seed Customers
INSERT INTO customers (id, name, email, phone, total_spent, status, avatar_text, vehicle_brand, vehicle_model, vehicle_year, vehicle_plate, join_date)
VALUES
  ('CUST-8902', 'Rafael Lima', 'rafael.lima@email.com', '+55 11 99822-1092', 45200.00, 'VIP', 'RL', 'BMW', 'M4 Competition', 2022, 'RXY-9021', '2025-01-15'),
  ('CUST-7741', 'Carolina Souza', 'carol.souza@email.com', '+55 21 98834-5501', 82550.00, 'VIP', 'CS', 'Porsche', '911 Carrera S', 2020, 'POR-9110', '2025-02-10'),
  ('CUST-4429', 'Marcos Andrade', 'mandrade.arq@email.com', '+55 11 97711-2233', 31000.00, 'ATIVO', 'MA', 'Audi', 'RS6 Avant', 2021, 'AUD-6600', '2025-03-01'),
  ('CUST-1102', 'Juliana Silva', 'ju.silva@email.com', '+55 31 99988-7766', 12400.00, 'INATIVO', 'JS', 'Mercedes-Benz', 'C300', 2019, 'MBZ-3000', '2024-11-20'),
  ('CUST-2051', 'Roberto Silva', 'roberto.silva@uol.com', '+55 11 98111-5432', 0.00, 'ATIVO', 'RS', 'Audi', 'RS6', 2022, 'OSX-8800', '2026-05-18')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  total_spent = EXCLUDED.total_spent,
  status = EXCLUDED.status,
  vehicle_brand = EXCLUDED.vehicle_brand,
  vehicle_model = EXCLUDED.vehicle_model,
  vehicle_plate = EXCLUDED.vehicle_plate;

-- Seed Leads
INSERT INTO leads (id, name, email, phone, vehicle_brand, vehicle_model, vehicle_year, vehicle_plate, description, category, value, priority, stage)
VALUES
  ('LEAD-101', 'Roberto Silva', 'roberto.silva@uol.com', '+55 11 98111-5432', 'Audi', 'RS6', 2022, 'OSX-8800', 'Falha Motor - Barulho metálico forte e perda repentina de potência nas acelerações.', 'Diagnóstico', NULL, 'URGENTE', 'leads'),
  ('LEAD-102', 'Mariana Costa', 'mari.costa@gmail.com', '+55 11 97232-1144', 'BMW', '320i', 2021, 'BMV-3200', 'Remap Stage 2 - Ajuste de ECU, pops & bangs discretos, instalação de downpipe esportivo.', 'Tuning', 4500.00, 'NORMAL', 'leads'),
  ('LEAD-103', 'João Pedro', 'jp.melo@gmail.com', '+55 11 96155-8899', 'VW', 'Golf GTI', 2018, 'GTI-2000', 'Revisão 60k - Troca de óleo DSG, velas de ignição de irídio, fluidos de freio, filtros.', 'Revisão', 2100.00, 'ALTA', 'leads'),
  ('LEAD-104', 'Carlos Eduardo', 'cadu.freios@gmail.com', '+55 11 98822-4411', 'Porsche', 'Macan', 2020, 'PST-1111', 'Freios - Troca de pastilhas de freio cerâmica e sensores de desgaste traseiro/dianteiro.', 'Manutenção', 8900.00, 'ALTA', 'quotes'),
  ('LEAD-105', 'Fernanda Lima', 'fefe.lima@ig.com.br', '+55 11 99111-2299', 'Mini', 'Cooper S', 2019, 'MIN-4400', 'Suspensão - Instalação de kit de molas esportivas Eibach e alinhamento técnico completo.', 'Upgrade', 12400.00, 'NORMAL', 'quotes'),
  ('LEAD-106', 'Lucas Almeida', 'lucasalm@outlook.com', '+55 11 99888-3333', 'Ford', 'Mustang GT', 2018, 'MST-5000', 'Kit Supercharger - Instalação completa de compressor mecânico Whipple Stage 2.', 'Tuning', 45000.00, 'URGENTE', 'negotiation')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  stage = EXCLUDED.stage,
  value = EXCLUDED.value;

-- Seed Service Orders
INSERT INTO service_orders (id, customer_id, customer_name, vehicle_brand, vehicle_model, vehicle_plate, description, status, total_value, items, notes)
VALUES
  ('OS-4501', 'CUST-8902', 'Rafael Lima', 'BMW', 'M4 Competition', 'RXY-9021', 'Instalação de Escape Esportivo Akrapovic de titânio e Downpipe completo.', 'execucao', 35000.00, '[{"description": "Sistema de Escape Akrapovic Titanio", "quantity": 1, "price": 30000.00}, {"description": "Downpipe Esportivo Inox 304", "quantity": 2, "price": 2000.00}, {"description": "Mão de Obra de Instalação e Ajuste Técnico", "quantity": 1, "price": 3000.00}]'::jsonb, 'Cliente requisitou cuidado extremo com o difusor traseiro de fibra de carbono.'),
  ('OS-4502', 'CUST-7741', 'Carolina Souza', 'Porsche', '911 Carrera S', 'POR-9110', 'Revisão geral dos 30.000km, troca de fluido de transmissão PDK e pastilhas dianteiras Brembo.', 'pronto', 15200.00, '[{"description": "Óleo de câmbio PDK OEM Porsche", "quantity": 6, "price": 800.00}, {"description": "Pastilhas de Freio Brembo Performance", "quantity": 1, "price": 6400.00}, {"description": "Filtro de cabine, ar motor e óleo", "quantity": 1, "price": 1500.00}, {"description": "Serviço de Alinhamento 3D de alta precisão", "quantity": 1, "price": 2500.00}]'::jsonb, 'Veículo em perfeito estado. Sem outros apontamentos mecânicos.'),
  ('OS-4503', 'CUST-4429', 'Marcos Andrade', 'Audi', 'RS6 Avant', 'AUD-6600', 'Diagnóstico e reparo da suspensão eletrônica pneumática (vazamento na bolsa traseira direita).', 'aguardando_pecas', 24700.00, '[{"description": "Bolsa de Suspensão Pneumática OEM Audi Traseira", "quantity": 1, "price": 19800.00}, {"description": "Fluido Hidráulico de suspensão especial", "quantity": 2, "price": 450.00}, {"description": "Serviço de Diagnóstico Eletrônico e Calibração", "quantity": 1, "price": 4000.00}]'::jsonb, 'Aguardando entrega da bolsa de ar importada da Alemanha (Previsão 2 dias).'),
  ('OS-4490', 'CUST-1102', 'Juliana Silva', 'Mercedes-Benz', 'C300', 'MBZ-3000', 'Balanço preventivo, troca de óleo do cárter do motor e geometria de suspensão.', 'entregue', 4300.00, '[{"description": "Óleo Sintético 5W40 Mercedes approved", "quantity": 7, "price": 150.00}, {"description": "Filtro de Óleo Mercedes Benz Original", "quantity": 1, "price": 250.00}, {"description": "Serviço Alinhamento + Balanceamento Integral de Rodas", "quantity": 1, "price": 3000.00}]'::jsonb, 'Geometria concluída sem contratempos. Cliente retirou o veículo e pagou à vista.')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  total_value = EXCLUDED.total_value,
  items = EXCLUDED.items;

-- Seed Inventory
INSERT INTO inventory (id, name, category, sku, quantity, price, compatibilities, min_stock)
VALUES
  ('STK-001', 'Pastilha de Freio Brembo Performance (Porsche/BMW)', 'Peças de Reposição', 'BRM-FR452', 6, 6400.00, ARRAY['Porsche 911 Carrera', 'Porsche Macan', 'BMW M4'], 2),
  ('STK-002', 'Kit Supercharger Whipple Stage 2 (Mustang V8)', 'Performance', 'WHP-V8MST2', 1, 38000.00, ARRAY['Ford Mustang GT V8 2018+'], 2),
  ('STK-003', 'Bolsa de Ar Pneumática Traseira (Audi RS6)', 'Peças de Reposição', 'AUD-PN-RS6', 0, 18500.00, ARRAY['Audi RS6 Avant', 'Audi RS7 Sportback'], 1),
  ('STK-004', 'Óleo Premium Motul 8100 X-Cess 5W40 (Sintético)', 'Lubrificantes', 'MTL-5W40-1L', 48, 120.00, ARRAY['BMW', 'Audi', 'Mercedes-Benz', 'Porsche', 'VW'], 12),
  ('STK-005', 'Filtro de Óleo Esportivo K&N Performance', 'Peças de Reposição', 'KN-FL-SP101', 15, 280.00, ARRAY['Audi RS6', 'BMW M4', 'VW Golf GTI'], 5),
  ('STK-006', 'Vela de Ignição NGK Iridium Racing', 'Eletrônica', 'NGK-IRD-RC', 32, 180.00, ARRAY['VW Golf GTI', 'BMW 320i', 'Ford Mustang'], 8),
  ('STK-007', 'Kit Forjado de Pistão & Biela (BMW M4 S55)', 'Performance', 'CP-BST-S55', 2, 15400.00, ARRAY['BMW M4 F82', 'BMW M2 Competiton'], 1)
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  price = EXCLUDED.price,
  min_stock = EXCLUDED.min_stock;


-- 6. Create FUNNEL_STAGES Table
CREATE TABLE IF NOT EXISTS funnel_stages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_timestamp_funnel_stages ON funnel_stages;
CREATE TRIGGER set_timestamp_funnel_stages
BEFORE UPDATE ON funnel_stages
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Seed Default Funnel Stages
INSERT INTO funnel_stages (id, title, color, position)
VALUES
  ('leads', 'Novo Lead', '#818cf8', 0),
  ('quotes', 'Orçamento Enviado', '#6366f1', 1),
  ('negotiation', 'Negociação', '#a5b4fc', 2),
  ('approved', 'Serviço Aprovado', '#10b981', 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  color = EXCLUDED.color,
  position = EXCLUDED.position;


-----------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-----------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_stages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to perform all operations (CRUD)
-- This ensures only logged-in users via Supabase Auth can query or mutate data

-- Customers table policies
DROP POLICY IF EXISTS "Allow logged-in users full access to customers" ON customers;
CREATE POLICY "Allow logged-in users full access to customers"
  ON customers
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Leads table policies
DROP POLICY IF EXISTS "Allow logged-in users full access to leads" ON leads;
CREATE POLICY "Allow logged-in users full access to leads"
  ON leads
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Service Orders table policies
DROP POLICY IF EXISTS "Allow logged-in users full access to service_orders" ON service_orders;
CREATE POLICY "Allow logged-in users full access to service_orders"
  ON service_orders
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Inventory table policies
DROP POLICY IF EXISTS "Allow logged-in users full access to inventory" ON inventory;
CREATE POLICY "Allow logged-in users full access to inventory"
  ON inventory
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Funnel Stages table policies
DROP POLICY IF EXISTS "Allow logged-in users full access to funnel_stages" ON funnel_stages;
CREATE POLICY "Allow logged-in users full access to funnel_stages"
  ON funnel_stages
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);


