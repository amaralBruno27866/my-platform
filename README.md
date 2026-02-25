# My Platform (MEAN)

[![API CI](https://github.com/amaralBruno27866/my-platform/actions/workflows/api-ci.yml/badge.svg)](https://github.com/amaralBruno27866/my-platform/actions/workflows/api-ci.yml)
![Coverage Gate](https://img.shields.io/badge/coverage%20gate-90%2F75%2F90%2F90-blue)

Initial repository setup for a MEAN project with:
- MongoDB
- Express (Node.js/TypeScript API)
- Angular (frontend)
- Redis
- Future PayPal integration

## 1) Prerequisites

- Node.js 20 (`nvm use`)
- npm 10+
- Docker + Docker Compose

## 2) Prepare the environment

```bash
npm install
npm run dev:infra
npm run health:infra
```

Expected services:
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## 3) Initialize the API (manual, next step)

Inside `apps/api`, you can set up your Express API with TypeScript.
Suggested minimum stack:
- `express`
- `typescript`
- `ts-node-dev`
- `mongoose`
- `ioredis`
- `zod`
- `dotenv`

## 4) Initialize Angular frontend (manual, next step)

Using Angular CLI:

```bash
npx @angular/cli@latest new apps/web --standalone --routing --style=scss --skip-git --package-manager npm
```

## 5) Stop infrastructure

```bash
npm run down:infra
```

## 6) Quality and automated tests

From repository root (`my-platform`), use:

```bash
npm run test:api
npm run test:api:watch
npm run test:api:coverage
npm run -w apps/api build
```

If you are already inside `apps/api`, use:

```bash
npm run test
npm run test:coverage
npm run build
```

Coverage is validated by threshold gate in CI (`statements >= 90`, `branches >= 75`, `functions >= 90`, `lines >= 90`).

Detailed Organization test documentation:

- `apps/api/src/class/organization/tests/README.md`

## Current structure

```text
.
├─ apps/
│  ├─ api/
│  │  └─ package.json
│  └─ web/
│     └─ package.json
├─ .env
├─ .gitignore
├─ .nvmrc
├─ docker-compose.yml
├─ package.json
└─ README.md
```
