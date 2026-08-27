# Arquitetura

## Fluxo principal

```text
React + shadcn/ui
        │ fetch
        ▼
Fastify route + JSON Schema
        │
        ▼
FeedbackService (casos de uso e regras)
        │ interface FeedbackRepository
        ▼
PrismaFeedbackRepository
        │
        ▼
SQLite
```

O frontend usa `fetch` nativo. A lista envia os filtros ativos ao backend; o backend aplica todos com `AND`, ordena por `createdAt DESC`, calcula as métricas sobre o mesmo resultado e devolve os dados em uma única resposta. O Sheet de detalhes carrega feedback e anotações em paralelo.

## Backend

| Arquivo | Responsabilidade |
| --- | --- |
| `apps/backend/src/app.ts` | Cria o Fastify, configura CORS, health check, rotas e error handler. Aceita `FeedbackService` injetado para testes. |
| `apps/backend/src/server.ts` | Inicializa o servidor na porta configurada. |
| `apps/backend/src/modules/feedbacks/routes.ts` | Mapeia os endpoints HTTP para o service e define respostas/status. |
| `apps/backend/src/modules/feedbacks/schemas.ts` | Valida params UUID, filtros, bodies e respostas com JSON Schema nativo. |
| `apps/backend/src/modules/feedbacks/service.ts` | Lista/calcula métricas, valida notas/status e bloqueia conclusão crítica sem nota. |
| `apps/backend/src/modules/feedbacks/repository.ts` | Implementa `FeedbackRepository` com Prisma. |
| `apps/backend/src/modules/feedbacks/types.ts` | Contratos do módulo e tipos derivados dos enums Prisma. |
| `apps/backend/src/shared/errors.ts` | Erros de domínio convertidos pelo app em 400/404/409. |
| `apps/backend/prisma/schema.prisma` | Modelos, enums, UUIDs, relação e índices. |

### SOLID aplicado sem camadas artificiais

- `FeedbackService` depende do contrato `FeedbackRepository`, não do Prisma diretamente.
- `PrismaFeedbackRepository` é a implementação de infraestrutura.
- O service é testado com um fake repository, sem banco ou porta real.
- Rotas não duplicam regras de negócio; apenas recebem, delegam e retornam HTTP.
- Schemas são a fronteira de validação da API; regras que dependem do estado do banco continuam no service.

O comando `npm run dev:backend` executa o `predev` do workspace. O script de setup garante o `.env` local, executa `db:generate` e `db:migrate:deploy`; o `db:seed` só roda automaticamente quando `apps/backend/prisma/dev.db` ainda não existe, evitando apagar dados a cada reinício.

## Dados

`Feedback` possui `id` UUID, `customerName`, `rating` de 1 a 5, `comment` opcional, `channel`, `status` e `createdAt`. `FeedbackNote` possui UUID, `feedbackId`, `description` não vazia e `createdAt`. A relação é 1:N e notas são removidas em cascata quando o feedback é removido.

Enums:

- Canais: `GOOGLE`, `IFOOD`, `PESQUISA`.
- Status: `NOVO`, `EM_ANALISE`, `CONCLUIDO`.

O seed recria 12 feedbacks e 3 notas em execução serial, deixando o Prisma gerar os UUIDs. Há dados críticos com e sem nota para demonstrar os dois caminhos de status.

## Contrato HTTP

| Método | Endpoint | Sucesso | Regras/erros |
| --- | --- | --- | --- |
| `GET` | `/api/feedbacks` | `200` com `items`, `total` e `metrics` | `search`, `channel`, `status` e `rating`; filtros combinados com `AND` |
| `GET` | `/api/feedbacks/:id` | `200` com o feedback | UUID inválido: `400`; inexistente: `404` |
| `GET` | `/api/feedbacks/:id/notes` | `200` com array de notas | UUID inválido: `400`; inexistente: `404` |
| `POST` | `/api/feedbacks/:id/notes` | `201` com a nota criada | descrição vazia/ausente: `400`; inexistente: `404` |
| `PATCH` | `/api/feedbacks/:id/status` | `200` com feedback atualizado | status inválido: `400`; inexistente: `404`; crítico sem nota: `409` |

Resposta de listagem:

```json
{
  "items": [
    {
      "id": "uuid",
      "customerName": "Ana Souza",
      "rating": 5,
      "comment": "Atendimento excelente",
      "channel": "GOOGLE",
      "status": "NOVO",
      "createdAt": "2026-08-26T12:00:00.000Z"
    }
  ],
  "total": 1,
  "metrics": { "averageRating": 5, "positive": 1, "critical": 0 }
}
```

Erros seguem `{ "error": { "code": "...", "message": "..." } }`. O error handler também preserva uma resposta segura `500` para falhas não previstas.

## Frontend

`apps/frontend/src/features/feedbacks` concentra tipos, API, hook e componentes da feature. `useFeedbacks` mantém filtros/listagem e cancela requests da lista com `AbortController`. O detalhe cancela requests de feedback/notas anteriores quando a seleção muda, evitando respostas fora de ordem.

O shell usa `Sidebar` shadcn inspirado no Sidebar 16: desktop expandido com marca e nome, tablet recolhido em ícones e mobile via menu/Sheet. A listagem alterna tabela em telas maiores e cards em telas menores. O detalhe usa `Sheet` lateral e ocupa a largura disponível no mobile.

Componentes UI são copiados como código para `apps/frontend/src/components/ui` e usam tokens semânticos do tema. A biblioteca Origin foi considerada como fonte copy/paste, mas os componentes oficiais shadcn já cobriram as necessidades; nenhuma dependência Origin foi adicionada.

## Limites deliberados

O volume do desafio não justifica paginação ou agregações SQL separadas: métricas são calculadas em uma passada sobre a lista filtrada. Login, permissões, CRUD de feedbacks e estado global também foram deliberadamente excluídos do escopo aprovado.
