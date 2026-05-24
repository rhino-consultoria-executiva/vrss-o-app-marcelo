// Standalone Database Migration Script for MC Automecânica & Performance
// Runs in Node.js environment: node supabase/migrate.js

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

async function runMigration() {
  console.log('---------------------------------------------------------');
  console.log('🤖 MC Automecânica - Automatizador de Migrações PostgreSQL');
  console.log('---------------------------------------------------------');

  const connectionString = dbUrl || process.argv[2];

  if (!connectionString) {
    console.error('❌ Erro: DATABASE_URL ou SUPABASE_DB_URL não configurada no arquivo .env');
    console.log('\nPor favor, adicione seu link de conexão no .env ou passe como argumento.');
    console.log('Exemplo: node supabase/migrate.js "postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres"');
    console.log('Exemplo no .env:');
    console.log('DATABASE_URL="postgresql://postgres:[SENHA_SUPABASE]@db.[ID_PROJETO].supabase.co:5432/postgres"\n');
    process.exit(1);
  }

  console.log('⏳ Conectando ao Banco de Dados Supabase...');
  
  const client = new pg.Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    const sqlPath = path.join(__dirname, 'migrations', '20260523000000_create_crm_tables.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo de migração não encontrado em: ${sqlPath}`);
    }

    console.log(`📖 Carregando arquivo de migração: ${path.basename(sqlPath)}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Executando queries de migração... (tabelas, triggers, políticas RLS e dados demonstrativos)');
    await client.query(sql);

    console.log('---------------------------------------------------------');
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('Todas as tabelas (customers, leads, service_orders, inventory, funnel_stages),');
    console.log('políticas de segurança RLS, índices e dados iniciais foram criados.');
    console.log('---------------------------------------------------------');
  } catch (error) {
    console.error('❌ Ocorreu um erro ao executar a migração:');
    console.error(error.message || error);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

runMigration();
