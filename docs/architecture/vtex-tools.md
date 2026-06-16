# Arquitetura VTEX Tools

## Decisões

- O App Router continua responsável por rotas, layouts e APIs.
- Cada ferramenta concentra sua UI em `modules/tools/<tool>`.
- Regras de comparação existentes permanecem em `lib/compare`; mover código sem necessidade aumentaria o risco.
- `config/tools.config.ts` é a fonte única para catálogo, sidebar e command palette.
- `components/ui` contém primitives shadcn; componentes de produto ficam no módulo ou em `components/layout` e `components/navigation`.
- As APIs mantêm os contratos existentes e agora exigem sessão Auth.js.
- O Prisma aceita Accelerate e conexão PostgreSQL direta por uma fábrica única.

## Estrutura

```text
app/
  tools/
    budget-audit/
    spreadsheet-validation/
  admin/
  api/
    spreadsheet-validation/
components/
  layout/
  navigation/
  ui/
config/
  tools.config.ts
hooks/
lib/
  auth/
  compare/
  db/
  spreadsheet-validation/
  vtex/
modules/
  tools/
    budget-audit/
      components/
      pages/
    spreadsheet-validation/
      pages/
```

## Validação de Planilhas

A ferramenta `spreadsheet-validation` substitui a execução manual do `index.js` por uma rota autenticada e uma UI dentro de Tools.

- Entrada aceita: CSV separado por `;` com as colunas `email` e `cnpjDoc`.
- Parser e validação vivem em `lib/spreadsheet-validation/csv.ts`.
- Regras de negócio vivem em `lib/spreadsheet-validation/executor.ts`.
- Integração VTEX Master Data fica em `lib/vtex/integrators.ts`.
- A API `app/api/spreadsheet-validation/route.ts` recebe o arquivo, valida cabeçalhos e envia progresso em NDJSON.
- A tela `modules/tools/spreadsheet-validation/pages/spreadsheet-validation-page.tsx` exibe upload, progresso, logs e downloads de auditoria.

O fluxo preserva a ação essencial do script original: localizar o integrador no Master Data `IN` e persistir `has_used_coupon: "false"` quando o valor atual está `true` ou vazio. A busca agora usa diretamente o CNPJ normalizado (`document`) vindo da planilha, removendo a dependência intermediária do cadastro `CL`.

## Adicionando uma ferramenta

1. Crie `modules/tools/<id>` somente com o código necessário ao domínio da ferramenta.
2. Exponha uma rota em `app/tools/<id>`.
3. Registre nome, descrição, ícone, categoria e `href` em `config/tools.config.ts`.
4. Marque `enabled: true` quando a rota estiver pronta.

Não existe loader dinâmico ou sistema de plugins: o registry estático é suficiente para o estágio atual e mantém tipagem, tree shaking e navegação simples.
