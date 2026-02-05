# Guia de Integração: Site -> Tudo1 (GHL)

Este guia detalha como configurar o "Inbound Webhook" no CRM Tudo1 (GHL) para receber os dados dos formulários do site (Contato e Calculadora).

## 1. O que já está pronto no Site

O site já está configurado para enviar dados para o seguinte Link de Webhook (que está no código atualmente):
`https://services.leadconnectorhq.com/hooks/7yA19Mve2EvPTqurPPsv/webhook-trigger/528a1b66-84eb-4c3e-9011-6480a71ff211`

> **IMPORTANTE**: Se você gerar um novo link de webhook na sua automação, você precisará nos avisar para atualizarmos no código do site (`assets/js/main.js`).

---

## 2. Configurando a Automação no Tudo1 (GHL)

Acesse a área de **Automações (Automations)** > **Fluxos de Trabalho (Workflows)** e crie um novo **"Start from Scratch"**.

### Passo A: Gatilho (Trigger)
1. Adicione um novo Trigger: **Incoming Webhook** (Webhook de Entrada).
2. O GHL vai gerar um URL. 
   - Se for o mesmo que listado acima, perfeito.
   - Se for diferente, **copie o novo URL** e atualize no arquivo `assets/js/main.js` (linha ~448).

### Passo B: Mapeamento de Dados (Map Data)
1. Para o GHL "aprender" os dados, você precisa fazer um envio de teste no site.
2. Vá no site (online ou local), preencha o formulário de contato e envie.
3. Volte na automação do GHL, clique no Trigger "Incoming Webhook" e depois em **Fetch Sample Requests**.
4. Selecione a requisição que apareceu. Você verá campos como:
   - `source` ("contato" ou "calculadora")
   - `name`
   - `email`
   - `phone`
   - `interest`
   - `timestamp`
   - (Dados extras da calculadora se for o caso: `roi`, `revenue`, `contacts`, etc.)
5. Salve o Trigger.

### Passo C: Ações do Fluxo (Actions)

Agora, configure o que acontece quando os dados chegam. Sugestão de estrutura:

#### 1. Criar/Atualizar Contato
- Adicione a ação **Create/Update Contact**.
- Mapeie os campos:
  - **First Name**: Selecione `Incoming Webhook Trigger > name`
  - **Email**: Selecione `Incoming Webhook Trigger > email`
  - **Phone**: Selecione `Incoming Webhook Trigger > phone`
  - **Tags**: Adicione uma tag fixa, ex: `#lead-site`

#### 2. Condicional (If/Else) - Tipo de Conversão
Crie uma condicional baseada no campo `source` (Origem):

**Ramo 1: Contato Geral**
- Condição: `Incoming Webhook Trigger > source` **É** `contato`
- **Ações sugeridas**:
  - Adicionar Tag: `#site-fale-conosco`
  - Adicionar Nota: "Interesse em: {{trigger.interest}}"
  - Notificar Usuário (Email/SMS para o comercial).

**Ramo 2: Calculadora / Simulação**
- Condição: `Incoming Webhook Trigger > source` **É** `calculadora`
- **Ações sugeridas**:
  - Adicionar Tag: `#site-simulador`
  - Atualizar Campo Personalizado (Custom Fields):
    - Se você quiser salvar o ROI, Faturamento, etc., crie Custom Fields no GHL (ex: `calc_roi`, `calc_contacts`) e use a ação **Update Contact Field** mapeando os dados do webhook.
  - Enviar Template de WhatsApp: "Olá {{contact.first_name}}, vi que você simulou um ROI de {{trigger.roi}}% no nosso site..."

**Ramo 3: Pedido de Atendimento (Pós-Calculadora)**
- Condição: `Incoming Webhook Trigger > action` **É** `solicitar_atendimento`
- **Ações sugeridas**:
  - Adicionar Tag: `#site-simulador-quente`
  - **Mover para Pipeline**: Criar oportunidade no funil de vendas em "Levantada de Mão".
  - Notificar Equipe Imediatamente (HOT LEAD 🔥).

---

## 3. Campos Disponíveis (Payload JSON)

Aqui está um exemplo real do que o site envia (copie e cole isso se precisar testar manualmente no Postman ou similar):

```json
{
  "source": "calculadora",
  "name": "Nome do Lead",
  "email": "lead@email.com",
  "phone": "11999999999",
  "interest": "crm",
  "contacts": 10000,
  "type": "marketing",
  "scenario": "pessimista",
  "ticket": 500,
  "cost": 3700,
  "conversions": 100,
  "revenue": 50000,
  "roi": 1251.35,
  "cpl": 37,
  "timestamp": "2026-02-05T03:13:13.424Z",
  "page_url": "https://tudo1.com.br/"
}
```

### Lista Detalhada de Campos:

**Padrão (Todos os envios):**
- `name` (Texto)
- `email` (Email)
- `phone` (Telefone)
- `interest` (Texto - Opção selecionada no dropdown)
- `source` (Texto - "contato", "calculadora", "calculadora_contato")
- `page_url` (Url da página)
- `timestamp` (Data/Hora)

**Específicos da Calculadora:**
- `contacts` (Número - Qtd de contatos)
- `type` (Texto - "marketing" ou "utility")
- `scenario` (Texto - "realista", "otimista", "pessimista")
- `ticket` (Monetário - Ticket médio)
- `cost` (Monetário - Custo estimado)
- `conversions` (Número - Conversões estimadas)
- `revenue` (Monetário - Faturamento estimado)
- `roi` (Número - % ROI)
- `cpl` (Monetário - Custo por Lead)

---

## Próximos Passos
1. Crie os Custom Fields no GHL para armazenar os dados ricos da calculadora (opcional, mas recomendado).
2. Configure o Workflow conforme acima.
3. Teste preenchendo os formulários no site e vendo o contato aparecer no GHL.
