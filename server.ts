import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

import { GoogleGenAI } from "@google/genai";

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gemini AI Smart Diagnosis Endpoint
app.post("/api/gemini/diagnostico", async (req, res) => {
  const { vehicleBrand, vehicleModel, vehicleYear, description, category, inventory } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    const mockDiagnosis = `### ⚠️ [DEMO - CHAVE GEMINI NÃO CONFIGURADA]
Laudo Técnico Avançado gerado com inteligência mecânica de contingência.

**Análise Preliminar do Veículo:**
* **Veículo:** ${vehicleBrand || 'N/A'} ${vehicleModel || 'N/A'} (${vehicleYear || 'N/A'})
* **Categoria do Serviço:** ${category || 'N/A'}
* **Sintoma Relatado:** "${description || 'Sem queixas relatadas.'}"

**Diagnóstico Provável:**
Considerando a queixa técnica relatada para o modelo **${vehicleModel || 'veículo'}**, há indícios fortes de desgaste preventivo ou falha passiva no circuito de admissão de ar, sensores eletrônicos ou alimentação de combustível. Recomenda-se realizar inspeção física minuciosa em elevador e leitura preventiva via scanner OBD-II de alta performance.

**Peças de Reposição Recomendadas (Estoque MC Automecânica):**
* Atualmente operando em modo offline de IA. Mapeamento dinâmico de chaves SKU indisponível sem a configuração da \`GEMINI_API_KEY\`. Verifique as configurações de variáveis de ambiente.

**Por favor, insira uma GEMINI_API_KEY válida na aba de Configurações > Secrets do AI Studio para ativar relatórios gerados em tempo real pela rede neural.**`;
    return res.json({ diagnosis: mockDiagnosis });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const inventoryPrompt = Array.isArray(inventory) 
      ? `Estoque disponível na oficina: \n${inventory.map((i: any) => `- ${i.name} (SKU: ${i.sku}, Qtd: ${i.quantity}, Preço: R$ ${i.price})`).join('\n')}`
      : "Estoque indisponível ou pátio vazio.";

    const prompt = `Você é o mecânico chefe especialista em performance e diagnóstico veicular de luxo e supercarros da oficina MC Automecânica e Performance.
Gere um laudo técnico inteligente e detalhado em português (usando Markdown) para o seguinte lead de serviço:

**Ficha do Veículo:**
- Marca: ${vehicleBrand || 'Não descrita'}
- Modelo: ${vehicleModel || 'Específico'}
- Ano do Modelo: ${vehicleYear || '2020'}
- Categoria Recomendada: ${category || 'Diagnóstico Geral'}
- Sintomas relatados / Reclamação do cliente: "${description || 'Verificação periódica no pátio.'}"

**Estoque Disponível na Oficina:**
${inventoryPrompt}

O laudo deve conter:
1. **Análise de Sintomas**: Explicação teórica minuciosa baseada no sintoma (ex: barulho metálico, perda de pressão, remap stage 2, revisão periódica) para o carro de modelo ${vehicleModel}.
2. **Recomendação de Peças**: Busque na lista de estoque acima se há itens compatíveis (por nome ou compatibilidades) ou cite se precisaremos importar de parceiros externos.
3. **Plano de Execução na Oficina**: Passo a passo operacional detalhado com foco de verificação técnica eletrônica e mecânica física.
4. **Tempo de Mão de Obra Estimado**: Forneça uma estimativa de horas técnicas de alta performance necessárias.
5. **Dica Especial de Performance/Tuning**: Dica para encantar o cliente com um Cross-selling inteligente (Exemplo: sugerir velas de rádio NGK, óleo Premium Motul, downpipes de alto rendimento, ou filtro esportivo se aplicável).

Seja conciso, direto, técnico e profissional. Escreva num tom de elite mecânica. Use títulos estruturados com negrito.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ diagnosis: response.text });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: err.message || "Erro desconhecido ao processar diagnóstico no servidor." });
  }
});

// Serve Vite in development, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server MC Automecânica running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
