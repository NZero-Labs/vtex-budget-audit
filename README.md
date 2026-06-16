# VTEX Tools

Hub interno da Amara Net Zero para utilitários operacionais VTEX. A primeira ferramenta disponível é a Auditoria de Orçamentos, migrada do produto VTEX Budget Audit.

## Rotas

- `/tools`: catálogo de ferramentas
- `/tools/budget-audit`: entrada da Auditoria de Orçamentos
- `/tools/budget-audit/cart`: orçamento vs carrinho
- `/tools/budget-audit/budgets`: orçamento vs orçamento
- `/admin`: gestão de usuários administradores

As rotas antigas `/`, `/home`, `/compare` e `/compare-budgets` continuam funcionando por redirect.

## Stack

- Next.js 15, React 19 e TypeScript estrito
- shadcn/ui com Radix Nova, Tailwind CSS 3 e Lucide
- Auth.js v5
- Prisma 7 e PostgreSQL
- Zod e Vitest

## Desenvolvimento

```bash
npm install
cp .env.local.example .env.local
npm run db:generate
npm run dev
```

Para Postgres local:

```bash
docker compose up -d postgres
```

Use `BU_PRISMA_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vtex_tools` para conexão direta. URLs `prisma+postgres://` continuam suportadas via Prisma Accelerate.

## Comandos

```bash
npm run lint
npm run test:run
npm run build
npm run db:push
npm run seed:user -- --email admin@empresa.com --password senha123 --name "Admin"
```

## Registro de ferramentas

O catálogo e a navegação usam uma única fonte da verdade em `config/tools.config.ts`. Para adicionar uma ferramenta, registre seus metadados e implemente o módulo correspondente em `modules/tools`.

Mais detalhes em `docs/architecture/vtex-tools.md`.
