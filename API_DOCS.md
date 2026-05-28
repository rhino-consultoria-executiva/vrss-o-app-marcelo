# Documentação da API - MC Automecânica CRM

Esta documentação descreve os endpoints disponíveis no servidor backend Node.js / Express da aplicação **MC Automecânica CRM**. Ela fornece exemplos práticos de requisições e respostas para facilitar a realização de testes de integração, testes automatizados e validações de fluxo.

---

## Informações Gerais

- **URL Base Local:** `http://localhost:3000`
- **Cabeçalho de Conteúdo Padrão:** `Content-Type: application/json`

---

## Endpoints da API

### 1. Verificação de Saúde da API (Health Check)
Verifica se o servidor backend está ativo e respondendo corretamente.

- **Método:** `GET`
- **Rota:** `/api/health`
- **Autenticação:** Nenhuma

#### Exemplo de Requisição
```bash
curl -X GET http://localhost:3000/api/health
```

#### Exemplo de Resposta (Sucesso)
- **Código HTTP:** `200 OK`
- **Corpo:**
```json
{
  "status": "ok"
}
```

---

### 2. Migração do Banco de Dados (Supabase/PostgreSQL)
Executa as migrações SQL para provisionamento das tabelas de clientes, leads, ordens de serviço, inventário e etapas do funil de vendas.

- **Método:** `POST`
- **Rota:** `/api/db/migrate`
- **Autenticação:** Nenhuma (Exige uma string de conexão válida)
- **Parâmetros no Corpo (JSON):**
  - `databaseUrl` *(opcional, string)*: URI completa de conexão com o banco de dados PostgreSQL. Se não for enviada, o servidor tentará usar as variáveis de ambiente `DATABASE_URL` ou `SUPABASE_DB_URL`.

#### Exemplo de Requisição (com payload)
```bash
curl -X POST http://localhost:3000/api/db/migrate \
  -H "Content-Type: application/json" \
  -d '{
    "databaseUrl": "postgresql://postgres:sua-senha@db.xxxxxx.supabase.co:5432/postgres"
  }'
```

#### Exemplo de Resposta (Sucesso)
- **Código HTTP:** `200 OK`
- **Corpo:**
```json
{
  "success": true,
  "message": "Todas as tabelas do CRM, triggers e dados do pátio foram migrados com sucesso para o Supabase!"
}
```

#### Exemplo de Resposta (Erro - Conectividade ou Parâmetros Ausentes)
- **Código HTTP:** `400 Bad Request` ou `500 Internal Server Error`
- **Corpo:**
```json
{
  "error": "É obrigatório fornecer a Connection String do PostgreSQL (Supabase DB URI) para executar as migrações."
}
```

---

### 3. Laudo Técnico Inteligente (Diagnóstico Gemini AI)
Gera um laudo técnico inteligente e detalhado em formato Markdown utilizando inteligência artificial com base nas especificações do veículo, reclamação do cliente e disponibilidade de estoque.

- **Método:** `POST`
- **Rota:** `/api/gemini/diagnostico`
- **Autenticação:** Nenhuma (Opcional: exige que `GEMINI_API_KEY` esteja configurada nas variáveis de ambiente do servidor para respostas reais da Inteligência Artificial. Caso contrário, retorna um laudo de contingência demonstrativo).
- **Parâmetros no Corpo (JSON):**
  - `vehicleBrand` *(obrigatório, string)*: Marca do veículo.
  - `vehicleModel` *(obrigatório, string)*: Modelo específico do carro.
  - `vehicleYear` *(obrigatório, string/number)*: Ano do veículo.
  - `description` *(obrigatório, string)*: Sintomas relatados ou queixas técnicas informadas pelo cliente.
  - `category` *(opcional, string)*: Categoria do serviço recomendado.
  - `inventory` *(opcional, array)*: Lista atual de peças no estoque para validação de compatibilidade. Cada item do array deve conter:
    - `id` *(string)*: ID único da peça.
    - `name` *(string)*: Nome comercial do item.
    - `sku` *(string)*: Código SKU identificador.
    - `quantity` *(number)*: Quantidade disponível.
    - `price` *(number)*: Preço de venda praticado.

#### Exemplo de Requisição
```bash
curl -X POST http://localhost:3000/api/gemini/diagnostico \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleBrand": "Porsche",
    "vehicleModel": "911 Carrera S",
    "vehicleYear": "2021",
    "description": "Luz da injeção acesa no painel acompanhada de falha em rotações acima de 4000 RPM e leve barulho de sopro sob carga.",
    "category": "Mecânica Avançada",
    "inventory": [
      {
        "id": "item-1",
        "name": "Pastilha de Freio Brembo",
        "sku": "BREM-PAD-911",
        "quantity": 4,
        "price": 850.00
      },
      {
        "id": "item-2",
        "name": "Bobina de Ignição Porsche OEM",
        "sku": "PORS-COIL-992",
        "quantity": 6,
        "price": 420.00
      }
    ]
  }'
```

#### Exemplo de Resposta (Sucesso)
- **Código HTTP:** `200 OK`
- **Corpo:**
```json
{
  "diagnosis": "### 🛠️ Laudo Técnico Avançado - MC Automecânica\n\n**Análise de Sintomas (Porsche 911 Carrera S 2021):**\nA luz de injeção acesa combinada com falhas em rotações elevadas (>4000 RPM) e o ruído soprado sob aceleração apontam para vazamento de pressão na pressurização do turbocompressor ou bobinas de ignição sofrendo 'fire-miss' sob alta carga térmica...\n\n**Recomendação de Peças:**\n- Identificamos no estoque da oficina a peça **Bobina de Ignição Porsche OEM (SKU: PORS-COIL-992)** compatível com as características do motor...\n\n**Plano de Execução:**\n1. Passagem de scanner OBD-II completo.\n2. Teste de fumaça na linha de pressurização da turbina...\n\n**Tempo Estimado:** 3.5 horas técnicas.\n\n**Dica de Performance:** Sugerimos a instalação de um filtro de ar cônico de alto rendimento inbox BMC e velas de ignição de Iridium para melhor aproveitamento da curva de torque."
}
```

---

## Dicas para Execução de Testes Automatizados

1. **Testando sem Chaves de API**: O endpoint `/api/gemini/diagnostico` foi desenvolvido com tratamento de contingência. Se a variável `GEMINI_API_KEY` não for provida, o teste não falhará, retornando uma resposta estática padronizada sob o código de sucesso `200`.
2. **Ambiente Isolado**: Certifique-se de que o servidor esteja sendo executado na porta `3000` (porta de ingress de pacotes do ambiente do desenvolvedor).
