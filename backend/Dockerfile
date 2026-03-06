FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS build
COPY tsconfig.json .
COPY prisma ./prisma
COPY src ./src
RUN npm run prisma:generate && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/index.js"]
