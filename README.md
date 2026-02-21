# My Platform (MEAN)

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
cp .env.example .env
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

## Current structure

```text
.
├─ apps/
│  ├─ api/
│  │  └─ package.json
│  └─ web/
│     └─ package.json
├─ .env.example
├─ .gitignore
├─ .nvmrc
├─ docker-compose.yml
├─ package.json
└─ README.md
```
