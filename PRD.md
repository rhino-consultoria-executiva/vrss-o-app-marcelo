# Documento de Requisitos de Produto (PRD) & Guia de Testes
## MC AutoMecânica CRM

Este documento serve como a **Descrição do Produto (PRD)** e um roteiro estruturado de testes para validar as funcionalidades do sistema **MC AutoMecânica CRM**. O aplicativo foi projetado para oficinas mecânicas modernas gerenciarem de ponta a ponta o relacionamento com clientes, controle de leads (funil de vendas), ordens de serviço e catálogo de peças/inventário com total integridade e sincronização em tempo real.

---

## 📅 Visão Geral da Arquitetura & UX

- **Interface Consolidada**: Layout limpo de tela única ou navegação modular ágil focado em produtividade.
- **Tema Visual**: Design moderno focado em contraste escuro (Carbon Onyx), tipografia com fontes profissionais (Inter para o sistema, JetBrains Mono para códigos/valores monetários), e elementos de acentuação na cor vermelha/índigo para clareza visual.
- **Sincronização Cloud**: Backend integrado e persistência local sincronizada para auditoria rápida de dados.

---

## 🛠️ Escopo de Atributos & Módulos Principais

### 1. Base de Clientes & Nova Integração de Histórico
Permite a visualização, filtragem técnica por marcas de veículo, edição completa e exclusão de cadastros.
*   **Histórico de Serviços Consolidado**: Dentro de cada perfil detalhado de cliente, foi construído um módulo avançado de histórico que exibe as Ordens de Serviço vinculadas ao cliente (seja pelo identificador exclusivo ou pela placa do veículo).
*   **Gestão de O.S. no Perfil**: Adicione novas Ordens de Serviço diretamente do perfil do cliente, altere status do serviço, consulte valores correntes, gerencie itens/peças e insira notas de observação técnica sem sair do modal do cliente.

### 2. Funil de Vendas (CRM Leads)
Quadro Kanban operacional estruturado para rastreabilidade de novos clientes e cotações.
*   **Fases do Funil**: Capta contatos sob colunas de prospecção, diagnóstico de avaria, orçamento elaborado, aprovado e fechado.
*   **Conversão Direta**: Ao atingir aprovação técnica, o Lead pode ser transformado e exportado automaticamente em uma Ordem de Serviço ativa com um clique.

### 3. Gerenciamento de Ordens de Serviço (O.S.)
Fluxo de trabalho interno para o chão de oficina.
*   **Acompanhamento de Status**: Diagnóstico ➜ Aguardando Peças ➜ Em Execução ➜ Pronto ➜ Entregue.
*   **Cálculo Automático**: Soma em tempo real de múltiplas peças e horas trabalhadas incluídas na ordem.

### 4. Controle de Inventário (Estoque de Peças)
Controle completo do estoque necessário para a manutenção ágil dos carros.
*   **Alertas Visuais**: Destaque automático para itens abaixo do estoque mínimo estabelecido.
*   **Vínculo Financeiro**: Cadastro de preço de custo, preço de venda e margens de lucro.

---

## 🧪 Guia Passo a Passo para Realização de Testes

Utilize os roteiros abaixo para simular a operação real na oficina e atestar a eficiência do sistema.

### Cenário 1: Fluxo Completo do Cliente e seu Histórico de Serviços (Novo Recurso)
1. Acesse o módulo **"Base de Clientes"** no menu lateral.
2. Escolha um cliente existente e clique no botão **"Editar"** (lápis) no canto direito da linha desse cliente.
3. No painel modular expandido, observe as duas divisões claras:
   - **Coluna Esquerda**: Dados cadastrais do cliente e do veículo principal (Marca, Modelo, Placa, Ano). Modifique e teste a digitação da placa em letras maiúsculas.
   - **Coluna Direita**: O **"Histórico de Serviços do Veículo"**. Se não houver serviços anteriores cadastrados para esta placa ou cliente, você verá um aviso de histórico vazio.
4. Clique no botão **"+ Nova O.S."** (localizado no topo da seção de histórico).
5. Preencha uma descrição (ex: `Troca de óleo sintético 5W30 e filtro`), adicione peças se necessário, preencha o valor e salve.
6. A nova O.S. aparecerá imediatamente listada em formato sanfona (accordion) dentro do próprio perfil do cliente!
7. Clique na ordem recém-lista para expandi-la:
   - Altere o status no menu suspenso (ex: de *Diagnóstico* para *Em Execução* ou *Pronto*).
   - Insira uma observação no campo de texto de **"Notas de Observação Técnica"** (ex: `Constatado vazamento na junta da tampa de válvulas`).
   - Altere itens de peças se desejar e valide se o preço total é recalculado.
8. Clique em **"Salvar Alterações"** no rodapé do modal principal para gravar as informações.

### Cenário 2: Conversão de Lead em Ordem de Serviço Real
1. Navegue para o **"Funil de Vendas"** (CRM).
2. Clique no botão **"Novo Lead"** e registre um interessado (ex: `Carlos Henrique`, carro `VW Golf 1.4 TSi`, placa `GHJ-9E88`, problema `Barulho na suspensão dianteira`).
3. Mova o card arrastando ou alterando o estágio para *Orçamento*.
4. Abra os detalhes do card do Carlos e clique no botão **"Aprovar & Iniciar Serviço"**.
5. O sistema fechará o card de prospecção e automaticamente gerará uma Ordem de Serviço oficial já preenchida na fila de serviços ativos.
6. Vá até a **"Base de Clientes"** ou no **"Histórico de Serviços"** do sistema e confirme se os dados do Carlos Henrique e a nova O.S. estão totalmente integrados e vinculados.

### Cenário 3: Alertas de Inventário e Peças para O.S.
1. Vá até o módulo **"Estoque / Peças"**.
2. Identifique ou crie um item com quantidade atual menor ou igual à quantidade mínima (ex: `Quantidade atual: 2, Mínimo: 5`).
3. Certifique-se de que o sistema apresenta o destaque visual em vermelho/laranja sinalizando **"Estoque Baixo"** para o operador de compras de autopeças.

---

Este PRD assegura que todos os critérios de aceitação foram cumpridos, combinando a gestão rigorosa de cadastro com um acompanhamento longitudinal focado na placa do veículo para auditorias futuras com agilidade.
