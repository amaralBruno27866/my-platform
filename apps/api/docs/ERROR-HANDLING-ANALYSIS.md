# Error Handling - Análise Comparativa com Padrões da Indústria

## Implementação Atual ✅

### Estrutura
```typescript
class AuthAppError extends Error {
  statusCode: number
  code: AuthErrorCode  
  message: string
  details?: unknown
}
```

### Resposta de Erro
```json
{
  "message": "Email is already in use",
  "code": "AUTH_EMAIL_ALREADY_IN_USE",
  "details": { "email": "user@example.com" }
}
```

### Pontos Fortes ✅
1. ✅ **Tipo-seguro** - Classes TypeScript com tipos bem definidos
2. ✅ **Códigos estruturados** - Enums para error codes
3. ✅ **HTTP status corretos** - 400, 401, 403, 404, 409, 500
4. ✅ **Conversores** - `toAuthAppError()`, `toOrganizationAppError()`
5. ✅ **Factory functions** - `authInvalidCredentialsError()`, etc.
6. ✅ **Error details** - Campo opcional para metadados
7. ✅ **Tratamento especial** - ZodError e MongoDB errors mapeados

---

## Padrões da Indústria 2025-2026

### 1. RFC 7807 - Problem Details for HTTP APIs ⭐ (IETF Standard)

**O padrão mais adotado pela indústria** (usado por Microsoft, Google, GitHub, Stripe)

```json
{
  "type": "https://api.example.com/problems/email-already-in-use",
  "title": "Email Already in Use",
  "status": 409,
  "detail": "The email user@example.com is already registered",
  "instance": "/api/auth/signup",
  "timestamp": "2026-03-08T12:34:56Z",
  "traceId": "e4d909c2-90f3-4a69-b5c7-8f5a3c9d2e1f"
}
```

**Campos RFC 7807:**
- `type` (URI) - Identificador único do tipo de problema
- `title` (string) - Resumo legível para humanos
- `status` (number) - HTTP status code
- `detail` (string) - Explicação específica da ocorrência
- `instance` (URI) - Referência à ocorrência específica
- Campos customizados permitidos

**Adoção:**
- ✅ Microsoft REST API Guidelines
- ✅ Google Cloud APIs
- ✅ GitHub API v3/v4
- ✅ Zalando RESTful API Guidelines
- ✅ Spring Framework (ProblemDetail)
- ✅ ASP.NET Core (RFC 7807 built-in)

### 2. JSON:API Error Format

```json
{
  "errors": [
    {
      "id": "e4d909c2-90f3-4a69-b5c7-8f5a3c9d2e1f",
      "status": "409",
      "code": "email_already_registered",
      "title": "Email Already in Use",
      "detail": "The email user@example.com is already registered",
      "source": {
        "pointer": "/data/attributes/email",
        "parameter": "email"
      },
      "meta": {
        "timestamp": "2026-03-08T12:34:56Z"
      }
    }
  ]
}
```

**Características:**
- Array de erros (suporte a múltiplos erros)
- `source.pointer` para validação de campos
- Usado por: Ember.js, Ruby on Rails (JSONAPI-Resources)

### 3. GraphQL Error Format

```json
{
  "errors": [
    {
      "message": "Email is already in use",
      "extensions": {
        "code": "EMAIL_ALREADY_IN_USE",
        "email": "user@example.com"
      },
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["signup"]
    }
  ]
}
```

### 4. Google Cloud Error Model

```json
{
  "error": {
    "code": 409,
    "message": "Email is already in use",
    "status": "ALREADY_EXISTS",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.BadRequest",
        "fieldViolations": [
          {
            "field": "email",
            "description": "user@example.com is already registered"
          }
        ]
      }
    ]
  }
}
```

---

## Comparação: Sua Implementação vs Indústria

| Aspecto | Implementação Atual | RFC 7807 | JSON:API | Avaliação |
|---------|---------------------|----------|----------|-----------|
| **HTTP Status** | ✅ Correto | ✅ | ✅ | Perfeito |
| **Error Code** | ✅ `code: string` | ✅ `type: URI` | ✅ `code: string` | Bom |
| **Message** | ✅ `message: string` | ✅ `title` + `detail` | ✅ `title` + `detail` | Bom |
| **Details** | ✅ `details: unknown` | ✅ Campos custom | ✅ `source` + `meta` | Bom |
| **Trace ID** | ❌ Ausente | ✅ Recomendado | ⚠️ Opcional | **Gap** |
| **Timestamp** | ❌ Ausente | ✅ Comum | ✅ `meta` | **Gap** |
| **Instance URI** | ❌ Ausente | ✅ Requerido | ⚠️ Opcional | Gap |
| **Múltiplos Erros** | ❌ Um por vez | ⚠️ Não padrão | ✅ Array | **Gap crítico** |
| **Field Validation** | ⚠️ Em `details` | ⚠️ Custom | ✅ `source.pointer` | Gap |
| **Content-Type** | `application/json` | `application/problem+json` | `application/vnd.api+json` | Gap menor |
| **Global Handler** | ❌ Try/catch manual | ✅ Middleware | ✅ Middleware | **Gap crítico** |
| **Logging** | ❌ Ausente | ⚠️ Recomendado | ⚠️ Recomendado | **Gap crítico** |
| **Env Sanitization** | ❌ Expõe tudo | ✅ Prod vs Dev | ✅ Prod vs Dev | **Gap segurança** |

---

## Gaps Críticos Identificados

### 1. 🔴 **Ausência de Global Error Handler**
**Problema:** Cada controller faz `try/catch` manual
```typescript
// Repetido em TODOS os controllers
try {
  // ...
} catch (error) {
  handleAuthError(error, res);
}
```

**Indústria usa:** Middleware centralizado
```typescript
app.use((err, req, res, next) => {
  // Trata TODOS os erros da aplicação
  const problemDetail = toProblemDetail(err);
  res.status(problemDetail.status).json(problemDetail);
});
```

**Impacto:**
- ❌ Código duplicado em 15+ endpoints
- ❌ Risco de esquecer try/catch
- ❌ Dificulta logging centralizado
- ❌ Sem rastreamento de erros

### 2. 🟡 **Sem Trace ID / Request ID**
**Problema:** Impossível rastrear requisições através dos logs

**Indústria usa:** Request ID em headers + resposta
```typescript
// Header: X-Request-ID: e4d909c2-90f3-4a69-b5c7-8f5a3c9d2e1f
{
  "traceId": "e4d909c2-90f3-4a69-b5c7-8f5a3c9d2e1f",
  "message": "Email already in use"
}
```

**Impacto:**
- ❌ Debug em produção muito difícil
- ❌ Sem correlação entre logs
- ❌ Impossível rastrear fluxo de requisição

### 3. 🔴 **Detalhes Expostos em Produção**
**Problema:** `details` pode vazar informações sensíveis

```typescript
// Expõe stack trace, db queries, etc
details: error // ⚠️ PERIGO em produção
```

**Indústria usa:** Sanitização por ambiente
```typescript
if (env.nodeEnv === 'production') {
  delete error.details;
  delete error.stack;
}
```

**Impacto:**
- 🔒 **Risco de segurança** - Vazamento de informações
- 🔒 Stack traces vazados
- 🔒 Database queries expostas

### 4. 🟡 **Sem Validação de Múltiplos Campos**
**Problema:** Retorna apenas primeiro erro de validação

```json
// Usuário corrige um campo, descobre outro erro
{
  "message": "Email is required"
}
// Depois:
{
  "message": "Password must be at least 8 characters"
}
```

**Indústria usa:** Array de erros
```json
{
  "errors": [
    { "field": "email", "message": "Email is required" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}
```

### 5. 🟡 **Sem Logging Estruturado**
**Problema:** Erros não são logados automaticamente

**Indústria usa:** Winston, Pino, Bunyan com structured logging
```typescript
logger.error({
  message: error.message,
  code: error.code,
  statusCode: error.statusCode,
  traceId: req.id,
  userId: req.auth?.sub,
  path: req.path,
  method: req.method,
  timestamp: new Date(),
  stack: error.stack
});
```

---

## Recomendações Priorizadas

### 🔴 Crítico (Implementar Agora)

1. **Global Error Handler Middleware**
   - Elimina try/catch duplicado
   - Logging centralizado
   - Resposta padronizada
   - **Esforço:** 2-3 horas

2. **Sanitização de Erros por Ambiente**
   - Protege dados sensíveis em produção
   - `details` e `stack` apenas em dev
   - **Esforço:** 1 hora

3. **Request ID / Trace ID**
   - Header `X-Request-ID`
   - Correlação de logs
   - **Esforço:** 1-2 horas

### 🟡 Importante (Próxima Sprint)

4. **Múltiplos Erros de Validação**
   - Melhor UX
   - Zod já suporta
   - **Esforço:** 2 horas

5. **Structured Logging**
   - Winston ou Pino
   - JSON logs para produção
   - **Esforço:** 3-4 horas

### 🟢 Melhorias Futuras

6. **Migração para RFC 7807**
   - Padrão da indústria
   - Documentação automática
   - **Esforço:** 4-6 horas

7. **Error Monitoring (Sentry, Rollbar)**
   - Alertas proativos
   - Error aggregation
   - **Esforço:** 2 horas

---

## Ferramentas Usadas pela Indústria

### Error Handling Libraries
- **[@hapi/boom](https://hapi.dev/module/boom/)** - HTTP-friendly errors (usado por NPM, Walmart)
- **[http-errors](https://www.npmjs.com/package/http-errors)** - Express-friendly errors
- **[problem-details](https://www.npmjs.com/package/problem-details)** - RFC 7807 implementation

### Logging
- **[Pino](https://getpino.io/)** - Fastest JSON logger (usado por Fastify, Netlify)
- **[Winston](https://github.com/winstonjs/winston)** - Most popular (IBM, Microsoft)
- **[Bunyan](https://github.com/trentm/node-bunyan)** - JSON logging (Netflix)

### Error Monitoring
- **[Sentry](https://sentry.io/)** - #1 error tracking (Disney, Microsoft, Peloton)
- **[Rollbar](https://rollbar.com/)** - Real-time error tracking
- **[Datadog APM](https://www.datadoghq.com/)** - Full observability

### Observability
- **[OpenTelemetry](https://opentelemetry.io/)** - CNCF standard (Google, Microsoft, AWS)
- **[Jaeger](https://www.jaegertracing.io/)** - Distributed tracing (Uber)

---

## Benchmark: Giants da Indústria

### Stripe API
```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "message": "Your card was declined",
    "decline_code": "generic_decline",
    "param": "exp_month",
    "charge": "ch_3..."
  }
}
```

### GitHub API
```json
{
  "message": "Validation Failed",
  "errors": [
    {
      "resource": "Issue",
      "field": "title",
      "code": "missing_field"
    }
  ],
  "documentation_url": "https://docs.github.com/rest/issues#create-an-issue"
}
```

### Microsoft Graph API (RFC 7807)
```json
{
  "error": {
    "code": "ResourceNotFound",
    "message": "The resource was not found",
    "innerError": {
      "date": "2026-03-08T12:34:56",
      "request-id": "e4d909c2-90f3...",
      "client-request-id": "..."
    }
  }
}
```

---

## Score da Implementação Atual

| Categoria | Score | Comentário |
|-----------|-------|------------|
| **Estrutura** | 8/10 | Boa estrutura OOP, tipagem forte |
| **Padronização** | 7/10 | Consistente, mas não RFC compliant |
| **Segurança** | 4/10 | ⚠️ Details expostos em prod |
| **Observabilidade** | 2/10 | ❌ Sem logging, sem trace ID |
| **DX (Developer UX)** | 6/10 | Precisa de try/catch manual |
| **Cliente UX** | 5/10 | Um erro por vez, sem context |
| **Manutenibilidade** | 7/10 | Código limpo, mas duplicado |
| **Produção-Ready** | 5/10 | ⚠️ Falta monitoring e logging |

**Score Geral: 5.5/10** (Funcional mas com gaps críticos)

---

## Próximos Passos

Quer que eu implemente alguma dessas melhorias? Recomendo começar por:

1. **Global Error Handler** (elimina duplicação, facilita logging)
2. **Request ID** (essencial para debugging)
3. **Environment Sanitization** (segurança crítica)

Posso criar uma implementação completa ou discutir a arquitetura primeiro?
