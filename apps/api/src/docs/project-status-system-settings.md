# Project Status e Diretriz de Configuração

Data: 2026-03-12

## Decisão Registrada

- A configuração atualmente em `env.ts` será gradualmente migrada para a entidade `system-settings`.
- Objetivo: permitir gerenciamento facilitado dessas configurações pelo usuário (sem depender apenas de variáveis de ambiente).
- Enquanto a migração não ocorre, o nível atual de cobertura será mantido como baseline aceito.

## Partes Concluídas

### 1) Infraestrutura global de tratamento de erros

- Estrutura de erros de aplicação (`AppError` e erros HTTP) implementada.
- Conversores de erro (Mongo/Zod/unknown) implementados e testados.
- Formatter de resposta de erro implementado e testado.
- Middleware global de erro implementado e testado.

### 2) Cobertura de testes nos módulos críticos

- Cobertura elevada nos módulos de `error-handling` para 100% (statements/branches/functions/lines nesses módulos).
- Inclusão de suíte dedicada para `validation-helper` com cobertura de branches em 100%.
- Cobertura de `organization/utils` melhorada para acima de 80% de branches.
- Testes totais passando no estado atual do projeto.

### 3) Fluxo de colaboração e entrega

- Ambiente de push via SSH para GitHub validado.
- Pipeline local de teste e cobertura funcionando.

## Itens Deliberadamente Pendentes

- Branches de `env.ts` e pontos com dependência de inicialização de processo/ambiente.
- Trechos defensivos ou dependentes de cenários raros que não trazem bom custo-benefício de teste no momento.
- Esses pontos serão endereçados com melhor custo-benefício durante a implementação de `system-settings`.

## Próxima Fase Planejada

### Entidade `system-settings`

- Criar módulo completo (schema, validators, services, repository, controllers, tests).
- Migrar gradualmente configurações hoje em `env.ts` para origem persistida.
- Expor gerenciamento seguro para usuário/admin, com validação e auditoria.
- Recalibrar cobertura para os novos fluxos (unitário + integração + e2e).
