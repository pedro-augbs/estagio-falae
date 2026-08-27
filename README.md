# Falaê — Dashboard de Feedbacks

Dashboard full stack para acompanhar feedbacks de clientes de um restaurante, consultar detalhes, registrar anotações internas e atualizar o status do atendimento.

## Stack

- Backend: Node.js, TypeScript, Fastify, Prisma e SQLite.
- Frontend: React, TypeScript, Vite, Tailwind CSS e shadcn/ui.
- Testes: `node:test`, testes do service e `fastify.inject()`.
- IDs: UUID gerado pelo Prisma com `@default(uuid())`.

## Requisitos

- Node.js 20.19+ (ou versão LTS mais recente).
- npm 10+.

## Instalação e execução

Na raiz do projeto:

```bash
npm install
```

O setup de desenvolvimento do backend é automático. Ao iniciar, o projeto cria `apps/backend/.env` a partir do exemplo caso necessário, gera o Prisma Client, aplica as migrations versionadas e executa o seed somente se o banco ainda não existir:

```bash
npm run dev:backend
```

O banco SQLite fica em `apps/backend/prisma/dev.db`. Para executar apenas o setup sem iniciar o servidor, use `npm --workspace apps/backend run dev:setup`. O seed explícito (`npm --workspace apps/backend run db:seed`) recria os dados de demonstração e deve ser usado somente quando essa reposição for desejada.

Suba os dois processos em terminais separados:

```bash
npm run dev:backend
npm run dev:frontend
```

O backend fica em `http://localhost:3333` e o frontend em `http://localhost:5173`.

## Comandos úteis

```bash
npm run build
npm test
npm --workspace apps/frontend run build
npm --workspace apps/backend run dev:setup
npm --workspace apps/backend run db:seed
```

`npm test` executa os testes automatizados dos dois workspaces. O build da raiz compila backend e frontend.

## Funcionalidades

- Listagem de feedbacks recentes, ordenada por data decrescente.
- Busca por cliente ou comentário.
- Filtros combináveis por canal, status e nota.
- Métricas recalculadas para o conjunto filtrado: total, média, positivos (4–5) e críticos (1–2).
- Tabela no desktop e cards no mobile, com sidebar adaptável para desktop, tablet e mobile.
- Sheet acessível com detalhes, anotações internas e atualização de status.
- Feedback crítico só pode ser concluído depois de receber pelo menos uma anotação; a regra é garantida no backend.
- Estados de loading, erro, vazio e sucesso.

## API

Base URL: `http://localhost:3333`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/api/feedbacks` | Lista feedbacks e métricas |
| `GET` | `/api/feedbacks/:id` | Consulta um feedback |
| `GET` | `/api/feedbacks/:id/notes` | Lista anotações |
| `POST` | `/api/feedbacks/:id/notes` | Cria anotação |
| `PATCH` | `/api/feedbacks/:id/status` | Atualiza status |

Filtros de `GET /api/feedbacks`: `search`, `channel`, `status` e `rating`. Todos os filtros enviados são aplicados com `AND`.

Exemplo de resposta da listagem:

```json
{
  "items": [],
  "total": 0,
  "metrics": {
    "averageRating": 0,
    "positive": 0,
    "critical": 0
  }
}
```

Criação de anotação:

```bash
curl -X POST http://localhost:3333/api/feedbacks/<uuid>/notes \
  -H "Content-Type: application/json" \
  -d '{"description":"Entramos em contato com o cliente."}'
```

Atualização de status:

```bash
curl -X PATCH http://localhost:3333/api/feedbacks/<uuid>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"CONCLUIDO"}'
```

Erros usam o envelope `{ "error": { "code": "...", "message": "..." } }`. Entrada inválida retorna `400`, feedback inexistente `404` e tentativa de concluir feedback crítico sem anotação `409` com o código `CRITICAL_FEEDBACK_REQUIRES_NOTE`.

## Arquitetura e decisões

O backend segue uma separação modular simples: rotas adaptam HTTP, o service concentra casos de uso e regras, e o repository concentra Prisma. As dependências do service são injetadas para permitir testes com fake repository.

No frontend, o estado fica nos hooks e componentes da feature de feedbacks. A comunicação usa `fetch` nativo; não há React Query, Axios, store global ou autenticação. Os componentes de interface são fontes shadcn/ui mantidas no repositório. A referência Origin foi consultada, mas não foi adicionada como dependência global.

Consulte [docs/architecture.md](docs/architecture.md) para o fluxo detalhado e [docs/progress.md](docs/progress.md) para o estado de validação.

## Fora do escopo

Não há login, cadastro de contas, perfis, permissões, criação/edição de feedbacks, deploy obrigatório, microsserviços ou paginação para o volume do desafio.

## Checklist de entrega

- [x] Backend Fastify inicia e expõe health check e API.
- [x] SQLite é criado por migration e populado por seed.
- [x] Busca, filtros combinados e métricas filtradas funcionam.
- [x] Detalhes, anotações e status funcionam sem reload manual.
- [x] Feedback crítico sem anotação não pode ser concluído.
- [x] Interface responsiva validada em mobile, tablet e desktop.
- [x] Testes automatizados e builds finais passam.
- [x] Nenhuma credencial real é versionada.

## Documentação para agentes

- [AI_USAGE.md](AI_USAGE.md): uso de agentes, decisões corrigidas em revisão e evidências.
- [docs/architecture.md](docs/architecture.md): módulos, dados e contrato.
- [docs/progress.md](docs/progress.md): tarefas, commits e pendências.
