# Uso de IA

## Ferramenta

O projeto foi desenvolvido com apoio do Codex, usando agentes auxiliares em um worktree Git isolado. A especificação visual e técnica foi discutida antes da implementação; cada etapa recebeu um brief próprio, uma implementação, uma revisão independente e, quando necessário, um ciclo de correção com re-revisão.

Não foram incluídos tokens, credenciais, dados reais de clientes ou instruções privadas neste arquivo.

## Onde houve apoio

- Exploração do desafio e confirmação de que o repositório não tinha projeto-base.
- Definição da arquitetura Fastify + Prisma + SQLite, contratos HTTP e direção visual shadcn/ui.
- Scaffold do monorepo, schema/migration/seed, service/repository, rotas, frontend e documentação.
- Revisão de acessibilidade, validação, consistência de estado e responsividade.

## Três prompts representativos

1. “Vamos fazer um projeto pra estágio; faça perguntas para obter o melhor resultado de acordo com o pedido.” Isso originou a especificação aprovada, sem login e com foco em dashboard responsivo.
2. “Estilos eu quero usar shadcnui” e “todos os componentes possíveis serão do shadcnui.” Isso orientou a instalação dos componentes como código-fonte, o uso de tokens semânticos e a consulta à referência Sidebar 16.
3. “Tudo seja documentado certinho para não ter problema entre agentes.” Isso originou os briefs por task, `docs/architecture.md`, `docs/progress.md` e este registro de uso.

## Sugestões corrigidas durante a revisão

As revisões encontraram e corrigiram pontos concretos:

- O seed inicialmente usava IDs fixos que não eram UUID. O código foi alterado para omitir os IDs e deixar o Prisma gerar UUIDs, mantendo um mapa interno para relacionar as notas.
- O parâmetro `:id` inicialmente aceitava qualquer string. O schema passou a exigir `format: "uuid"` e foi adicionado teste que confirma `400` para ID inválido.
- A lista inicialmente parecia clicável mesmo com seleção sem ação na Task 6. A affordance foi removida até o detalhe ser implementado na Task 7.
- Depois, a seleção foi reintroduzida com botão acessível dentro da célula da tabela, em vez de transformar `<tr>` em botão. O carregamento de detalhe/notas também recebeu `AbortController` para evitar respostas fora de ordem.
- O setup manual repetitivo do backend foi consolidado em `apps/backend/scripts/dev-setup.ts`, com seed somente no primeiro banco e tratamento da execução de scripts npm no Windows.

Esses ajustes foram detectados por revisão de diff e registrados nos relatórios locais de cada task.

## Validação

As validações registradas ao longo do trabalho incluem:

- `npm test`: 26 testes do backend e 6 testes do frontend passando.
- `npm --workspace apps/frontend run build`: build Vite/TypeScript passando.
- Testes focados do frontend: query builder 2/2 e API 3/3.
- Testes do service: 11/11.
- Testes do repository: 2/2.
- Testes HTTP: 10/10.
- Fluxo manual: tentativa de concluir crítico sem nota retorna 409; nota retorna 201; conclusão após nota retorna 200; filtros e métricas são atualizados.
- Seed executado novamente em série: 12 feedbacks e 3 notas, com UUIDs válidos.

A validação final e a revisão ampla foram concluídas; os comandos e limitações estão em [docs/progress.md](docs/progress.md).
