# VTEX Budget Audit

Dashboard para comparar orçamentos (Master Data) com carrinhos (OrderForm) da VTEX, identificando e destacando divergências com impacto financeiro.

## Visão Geral

Esta aplicação permite:

- Comparar orçamentos armazenados no Master Data com carrinhos ativos (OrderForm)
- Identificar divergências de itens, preços, quantidades, promoções e frete
- Visualizar impacto financeiro das diferenças
- Exportar relatório em CSV

## Tecnologias

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS** + Design System Amara NZero
- **Auth.js v5** (NextAuth) - Autenticação
- **Prisma ORM** + Prisma Postgres - Banco de dados
- **Zod** (validação)
- **Vitest** (testes)

## Design System - Amara NZero

A aplicação utiliza o design system corporativo Amara NZero, focado em energia, sustentabilidade e tecnologia B2B.

### Cores Principais

| Token         | Hex     | Uso                                     |
| ------------- | ------- | --------------------------------------- |
| `green-main`  | #00953b | Brand, botões primários, status sucesso |
| `green-light` | #76bc21 | Botões secundários, hover states        |
| `green-lime`  | #c1d116 | Acentos, badges de info                 |

### Cores Secundárias

| Token         | Hex     | Uso                      |
| ------------- | ------- | ------------------------ |
| `brand-black` | #3c3c3b | Texto principal, títulos |
| `grey-dark`   | #575756 | Subtítulos, labels       |
| `grey-medium` | #9d9c9c | Texto secundário, bordas |

### Cores de Status

| Token            | Hex     | Uso               |
| ---------------- | ------- | ----------------- |
| `status-success` | #00953b | Sucesso, OK       |
| `status-warning` | #ffc000 | Alertas, atenção  |
| `status-error`   | #d32f2f | Erros, crítico    |
| `status-info`    | #1c9bd8 | Informação, links |

### Tipografia

Fonte principal: **Lato** (Google Fonts)

- Light: 300
- Regular: 400
- Medium: 500
- Bold: 700
- Black: 900

### UI Tokens

```css
/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Shadows */
--shadow-card: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-modal: 0 8px 24px rgba(0, 0, 0, 0.12);
```

### Tema Dark/Light

A aplicação suporta 3 modos de tema:

| Modo   | Descrição                                  |
| ------ | ------------------------------------------ |
| Light  | Tema claro com fundo branco                |
| Dark   | Tema escuro com fundo cinza                |
| System | Segue a preferência do sistema operacional |

O toggle de tema está localizado no header. A preferência é salva no localStorage e persiste entre sessões.

## Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd vtex-budget-audit

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.local.example .env.local

# Editar .env.local com suas credenciais VTEX
```

## Configuração

### Variáveis de Ambiente

Edite o arquivo `.env.local` com suas credenciais:

```env
# Conta VTEX
VTEX_ACCOUNT=suaconta
VTEX_ENVIRONMENT=vtexcommercestable

# Credenciais de API
VTEX_APP_KEY=vtexappkey-xxx
VTEX_APP_TOKEN=seu-token-aqui

# Entidade Master Data para orçamentos
MASTERDATA_ENTITY=budget

# Thresholds de criticidade (opcional)
CRITICAL_DIFF_THRESHOLD_PCT=0.5
CRITICAL_DIFF_THRESHOLD_ABS=50

# Modo mock para desenvolvimento (opcional)
USE_MOCK_DATA=false
```

### Obtendo Credenciais VTEX

1. Acesse o Admin VTEX
2. Vá em **Account Settings > Application Keys**
3. Crie ou copie uma chave existente com permissões para:
   - Checkout API (leitura)
   - Master Data API v2 (leitura)

## Autenticação

A aplicação requer login para acesso. Existem dois tipos de usuários:

- **USER**: Acesso ao comparador (`/compare`)
- **ADMIN**: Acesso ao comparador e painel administrativo (`/admin`)

### Variáveis de Ambiente para Autenticação

```env
# Auth.js
NEXTAUTH_SECRET=your-secret-here  # Gerar com: openssl rand -base64 32
NEXTAUTH_URL=https://seu-app.vercel.app

# Prisma Postgres
BU_PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...
```

### Configurando Prisma Postgres

1. Acesse [console.prisma.io](https://console.prisma.io)
2. Crie um novo projeto e banco de dados Postgres
3. Copie a connection string (formato: `prisma+postgres://accelerate.prisma-data.net/?api_key=...`)
4. Configure `BU_PRISMA_DATABASE_URL` no `.env`

### Criando a Tabela de Usuários

```bash
# Gerar Prisma Client
npm run db:generate

# Aplicar schema ao banco
npm run db:push
```

### Criando o Primeiro Usuário (Admin)

```bash
# Criar usuário via CLI
npx tsx scripts/seed-user.ts --email admin@empresa.com --password senha123 --name "Admin"

# Promover a administrador
npx tsx scripts/set-admin.ts admin@empresa.com
```

### Painel de Administração

Usuários com role ADMIN têm acesso ao painel em `/admin`:

- **Listar usuários**: Visualizar todos os usuários cadastrados
- **Criar usuário**: Adicionar novos usuários com nome, email, senha e role
- **Editar usuário**: Alterar dados, role e status (ativo/inativo)
- **Desativar usuário**: Soft delete (usuário não consegue mais fazer login)

O link "Admin" aparece no header apenas para administradores.

### Fluxo de Autenticação

1. Usuário acessa `/compare` ou `/admin`
2. Middleware redireciona para `/login` se não autenticado
3. Middleware verifica role ADMIN para acessar `/admin`
4. Usuário faz login com email/senha
5. Sessão JWT é criada (válida por 12 horas)
6. Usuário é redirecionado para a página solicitada

## Uso

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar http://localhost:3000
```

### Produção

```bash
# Build
npm run build

# Iniciar
npm start
```

### Testes

```bash
# Executar testes
npm test

# Testes com watch
npm run test:run
```

## Como Usar a Aplicação

1. **Acesse `/compare`** (ou a raiz, que redireciona)

2. **Informe os dados:**
   - **URL do Carrinho**: Cole a URL do checkout VTEX ou o `orderFormId` diretamente
   - **ID do Orçamento**: ID do documento no Master Data

3. **Clique em Comparar**

4. **Analise os resultados:**
   - Cards de resumo com totais
   - Tabela de itens com diferenças destacadas
   - Seção de promoções
   - Dados de entrega
   - Legenda de criticidade

5. **Exporte se necessário:** Clique em "Exportar CSV" para download

## Estrutura do Projeto

```
vtex-budget-audit/
├── app/
│   ├── compare/
│   │   ├── page.tsx              # Página principal
│   │   └── components/           # Componentes da página
│   │       ├── InputForm.tsx
│   │       ├── SummaryCards.tsx
│   │       ├── ItemDiffTable.tsx
│   │       ├── PromoDiffs.tsx
│   │       ├── ShippingDiffs.tsx
│   │       └── DiffLegend.tsx
│   ├── api/
│   │   └── compare/
│   │       └── route.ts          # API Route
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── vtex/
│   │   ├── config.ts             # Configuração VTEX
│   │   ├── orderForm.ts          # Cliente Checkout API
│   │   ├── masterData.ts         # Cliente Master Data API
│   │   └── mocks.ts              # Dados mockados
│   ├── compare/
│   │   ├── types.ts              # Tipagens
│   │   ├── normalizers.ts        # Normalização de dados
│   │   └── compareUtils.ts       # Lógica de comparação
│   └── utils/
│       └── formatters.ts         # Formatação
├── components/
│   └── ui/                       # Componentes reutilizáveis
├── __tests__/                    # Testes unitários
└── .env.local.example
```

## APIs VTEX Utilizadas

### Checkout API - OrderForm

```
GET /api/checkout/pub/orderForm/{orderFormId}
```

Documentação: https://developers.vtex.com/docs/api-reference/checkout-api

### Master Data API v2

```
GET /api/dataentities/{entity}/documents/{id}
GET /api/dataentities/{entity}/search?_where=idBudget={value}
```

Documentação: https://developers.vtex.com/docs/api-reference/master-data-api-v2

## Regras de Comparação

### Itens

| Cenário                                | Criticidade |
| -------------------------------------- | ----------- |
| Item no orçamento, ausente no carrinho | Crítica     |
| Item no carrinho, ausente no orçamento | Alta        |
| Diferença de preço > 5%                | Alta        |
| Diferença de preço 1-5%                | Média       |
| Diferença de quantidade                | Média       |

#### Comparação de Preço

A comparação de preços utiliza o campo `sellingPrice` (preço de venda) em ambos os lados:

| Fonte     | Campo               | Descrição                           |
| --------- | ------------------- | ----------------------------------- |
| Carrinho  | `item.sellingPrice` | Preço de venda do item no OrderForm |
| Orçamento | `item.sellingPrice` | Preço de venda do item no Budget    |

Se `sellingPrice` não existir no orçamento, utiliza `price` como fallback.

### Totais

| Cenário                          | Criticidade |
| -------------------------------- | ----------- |
| Total difere > 0.5% ou > R$ 50   | Crítica     |
| Diferença de frete significativa | Média/Alta  |

### Entrega

| Cenário                   | Criticidade |
| ------------------------- | ----------- |
| CEP diferente             | Alta        |
| Tipo de entrega diferente | Média       |

#### Mapeamento de Tipo de Entrega (Carrinho → Orçamento)

| Carrinho (selectedSla) | Orçamento (deliveryType/shippingType) |
| ---------------------- | ------------------------------------- |
| AMARANZ LOGISTICA CAJ  | PDO/CIF                               |
| AMARANZ LOGISTICA FSA  | PDO/CIF                               |
| EXP LOGISTICA CAJ      | EXP/CIF                               |
| EXP LOGISTICA FSA      | EXP/CIF                               |
| FOB LOGISTICA CAJ      | PDO/FOB                               |
| FOB LOGISTICA FSA      | PDO/FOB                               |

- **PDO** = Padrão
- **EXP** = Expresso
- **CIF** = Frete incluso
- **FOB** = Frete por conta do cliente

#### Campos de Frete no Orçamento

| Campo                   | Descrição                       |
| ----------------------- | ------------------------------- |
| `address.postalCode`    | CEP do cliente                  |
| `deliveryType`          | Tipo de entrega (PDO ou EXP)    |
| `shippingType`          | Tipo de frete (CIF ou FOB)      |
| `shipping`              | Valor do frete base (CIF/PDO)   |
| `shippingDeliveryValue` | Diferença para entrega expressa |

#### Campos de Desconto no Orçamento

| Campo               | Prioridade | Descrição                                       |
| ------------------- | ---------- | ----------------------------------------------- |
| `items[].priceTags` | 1          | Array de descontos por item (valores negativos) |
| `discounts`         | 2          | Valor total de descontos                        |
| `totals.discount`   | 3          | Valor de desconto (fallback)                    |

##### Estrutura do PriceTag

```typescript
{
  name: string;       // Nome do desconto/promoção
  identifier?: string; // ID da promoção
  value: number;      // Valor (negativo = desconto)
  isPercentual?: boolean;
}
```

#### Campos de Frete no Carrinho

| Campo                             | Descrição                   |
| --------------------------------- | --------------------------- |
| `shippingData.address.postalCode` | CEP de entrega              |
| `logisticsInfo[0].selectedSla`    | Tipo de entrega selecionado |
| `totalizers.Shipping`             | Valor total do frete        |

## Modo Mock

Para desenvolvimento sem conexão com VTEX:

```env
USE_MOCK_DATA=true
```

Os dados mockados estão em `lib/vtex/mocks.ts` e simulam cenários comuns de divergência.

## Customização da Entidade Budget

A estrutura esperada do Budget no Master Data pode ser customizada em:

- `lib/compare/types.ts` - Interface `VTEXBudget`
- `lib/compare/normalizers.ts` - Função `normalizeBudget`

### Estrutura Padrão do Budget

```typescript
{
  id: string;
  idBudget: string | number;
  items: [{
    skuId: string;
    name: string;
    quantity: number;
    price: number;        // Preço de lista (original)
    sellingPrice: number; // Preço de venda (usado na comparação)
    totalPrice: number;
    sellerId?: string;
    // Descontos aplicados ao item (valores negativos)
    priceTags?: [{
      name: string;
      identifier?: string;
      value: number;    // negativo = desconto
      isPercentual?: boolean;
    }];
  }];
  totals?: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
  // Endereço de entrega (contém CEP)
  address?: {
    postalCode: string;  // CEP do cliente
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  // Valor total de descontos (fallback se não houver priceTags)
  discounts?: number;
  // Campos de entrega (Amara NZero)
  deliveryType?: string;        // PDO (Padrão) ou EXP (Expresso)
  shippingType?: string;        // CIF (frete incluso) ou FOB (por conta do cliente)
  shipping?: number;            // Valor do frete base (CIF/PDO)
  shippingDeliveryValue?: number; // Diferença para entrega expressa
  // Dados customizados
  customData?: Record<string, unknown>;
  promotions?: [{
    id: string;
    name: string;
    value: number;
  }];
}
```

## Referências VTEX

- [Checkout API Reference](https://developers.vtex.com/docs/api-reference/checkout-api)
- [Master Data API v2](https://developers.vtex.com/docs/api-reference/master-data-api-v2)
- [OrderForm Fields](https://developers.vtex.com/docs/guides/orderform-fields)
- [io-clients](https://github.com/vtex/io-clients) - Exemplos de clientes VTEX
- [node-vtex-api](https://github.com/vtex/node-vtex-api) - Patterns de API
- [react-app-template](https://github.com/vtex-apps/react-app-template) - Template de apps
- [order-manager](https://github.com/vtex-apps/order-manager) - Gerenciamento de orders

## Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

MIT
