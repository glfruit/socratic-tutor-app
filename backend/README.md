# Socratic Tutor Backend

## Start (local)

1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install and generate Prisma client:
   ```bash
   npm install
   npm run prisma:generate
   ```
3. Run:
   ```bash
   npm run dev
   ```

## Test

```bash
npm test
```

## Docker

From repo root:

```bash
docker compose up --build
```
