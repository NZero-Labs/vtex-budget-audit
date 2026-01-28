# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.4.0] - 2026-01-23

### Added
- **Suporte a Tema Dark/Light**: Toggle de tema no header com 3 opções:
  - Light: Tema claro
  - Dark: Tema escuro
  - System: Segue preferência do sistema operacional
- Componente `ThemeProvider` para gerenciamento de tema
- Componente `ThemeToggle` com ícones de sol, lua e monitor
- Persistência de tema no localStorage

### Changed
- Layout atualizado com suporte a transição de cores
- Todos os componentes UI atualizados com classes `dark:`
- Cards, inputs, textos e borders adaptados para dark mode

## [0.3.3] - 2026-01-23

### Changed
- **Comparação de Preço dos Itens**: Agora utiliza `sellingPrice` (preço de venda) em vez de `price` (preço de lista)
- Carrinho: `item.sellingPrice` → Orçamento: `item.sellingPrice`
- Se `sellingPrice` não existir, faz fallback para `price`

### Added
- Campo `sellingPrice` em `VTEXBudgetItem` para preço de venda com descontos aplicados

## [0.3.2] - 2026-01-23

### Changed
- **Cálculo de Descontos do Orçamento**: Agora utiliza os `priceTags` dos itens (prioridade):
  1. Soma dos valores negativos dos `priceTags` de cada item
  2. Campo `discounts` direto no orçamento
  3. Campo `totals.discount`

### Added
- Interface `VTEXPriceTag` para representar descontos e ajustes de preço
- Campo `priceTags` em `VTEXBudgetItem` para descontos por item
- Função `calculateDiscountsFromPriceTags()` para somar descontos dos itens

## [0.3.1] - 2026-01-23

### Changed
- **Extração de CEP do Orçamento**: Agora utiliza o campo `address.postalCode` (antes era `customData`)
- **Extração de Desconto do Orçamento**: Agora utiliza o campo `discounts` (prioridade sobre `totals.discount`)

### Added
- Campo `address` no tipo `VTEXBudget` para armazenar endereço de entrega
- Campo `discounts` no tipo `VTEXBudget` para valor total de descontos

## [0.3.0] - 2026-01-23

### Changed
- **Extração de CEP do Orçamento**: Implementada extração flexível de CEP
- **Mapeamento de Tipo de Entrega**: Implementado mapeamento entre tipos de entrega do carrinho e orçamento:
  - `AMARANZ LOGISTICA CAJ/FSA` → `PDO/CIF`
  - `EXP LOGISTICA CAJ/FSA` → `EXP/CIF`
  - `FOB LOGISTICA CAJ/FSA` → `PDO/FOB`
- **Valor do Frete no Carrinho**: Agora utiliza o `totalizer.Shipping` (mais confiável)
- **Valor do Frete no Orçamento**: 
  - Campo `shipping` = valor base (CIF/PDO)
  - Campo `shippingDeliveryValue` = diferença para entrega expressa (EXP)

### Added
- Novos campos no tipo `VTEXBudget`:
  - `customData`: dados customizados com CEP e outras informações
  - `deliveryType`: tipo de entrega (PDO/EXP)
  - `shippingType`: tipo de frete (CIF/FOB)
  - `shipping`: valor do frete base
  - `shippingDeliveryValue`: valor adicional para entrega expressa
- Função `mapCartDeliveryTypeToBudget()` para conversão de tipos de entrega
- Função `areDeliveryTypesEquivalent()` para comparação inteligente de tipos
- Função `extractPostalCodeFromCustomData()` para extração flexível de CEP

## [0.2.0] - 2026-01-23

### Changed
- Aplicado Design System Amara NZero em toda a aplicação
- Nova paleta de cores: verde principal (#00953b), verde claro (#76bc21), verde limão (#c1d116)
- Cores secundárias: preto (#3c3c3b), cinza escuro (#575756), cinza médio (#9d9c9c)
- Cores complementares: amarelo (#ffc000), ciano (#1c9bd8), azul (#2e75b6)
- Cores de status: success (#00953b), warning (#ffc000), error (#d32f2f), info (#1c9bd8)
- Tipografia atualizada para fonte Lato (Google Fonts)
- Header com gradiente corporativo (verde -> limão)
- Cards, badges, botões e tabelas seguindo o style guide
- Border radius padronizado (sm: 4px, md: 8px, lg: 12px)
- Sombras padronizadas (card e modal)
- UI tokens para espaçamento (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px)

## [0.1.0] - 2026-01-23

### Added

#### Funcionalidades Principais
- Dashboard de comparação Budget vs OrderForm
- Formulário de entrada com URL do carrinho e ID do orçamento
- Extração automática de `orderFormId` de URLs VTEX
- Busca paralela de dados no Master Data e Checkout API

#### Comparação de Dados
- Comparação de itens (SKU, quantidade, preço)
- Detecção de itens faltantes no carrinho
- Detecção de itens extras no carrinho
- Comparação de totais financeiros (subtotal, descontos, frete, total)
- Comparação de dados de entrega (CEP, tipo, valor)
- Comparação de promoções/benefícios aplicados

#### Visualização
- Cards de resumo com totais lado a lado
- Tabela de itens com filtros (todos, divergentes, críticos)
- Destaque visual por nível de criticidade (crítico, alto, médio, baixo)
- Explicações detalhadas de cada divergência
- Legenda de criticidade

#### Exportação
- Exportação de relatório em CSV
- Inclusão de todos os dados comparados no export

#### Infraestrutura
- Projeto Next.js 15 com App Router
- TypeScript com tipagem completa
- Tailwind CSS para estilos
- API Route para orquestração server-side
- Modo mock para desenvolvimento sem VTEX
- Testes unitários com Vitest

#### Documentação
- README com instruções completas
- Comentários no código
- Referências às APIs VTEX oficiais

### Parâmetros de Configuração
- `VTEX_ACCOUNT` - Nome da conta VTEX
- `VTEX_ENVIRONMENT` - Ambiente (vtexcommercestable)
- `VTEX_APP_KEY` - Chave de API
- `VTEX_APP_TOKEN` - Token de API
- `MASTERDATA_ENTITY` - Entidade do Master Data para budgets
- `CRITICAL_DIFF_THRESHOLD_PCT` - Threshold percentual para criticidade
- `CRITICAL_DIFF_THRESHOLD_ABS` - Threshold absoluto em reais para criticidade
- `USE_MOCK_DATA` - Ativar modo mock

### APIs Integradas
- VTEX Checkout API (GET OrderForm)
- VTEX Master Data API v2 (GET/Search documents)

### Regras de Criticidade
- **Crítico**: Item faltando, total > 0.5% ou > R$ 50 de diferença
- **Alto**: Item extra, preço > 5% diferente, CEP diferente
- **Médio**: Preço 1-5% diferente, quantidade diferente, tipo entrega diferente
- **Baixo**: Diferenças menores sem impacto significativo

---

## Tipos de Mudanças

- `Added` - Novas funcionalidades
- `Changed` - Mudanças em funcionalidades existentes
- `Deprecated` - Funcionalidades que serão removidas
- `Removed` - Funcionalidades removidas
- `Fixed` - Correções de bugs
- `Security` - Correções de segurança
