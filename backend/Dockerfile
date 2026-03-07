FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
# 先复制 prisma schema，因为 postinstall 需要它
COPY prisma ./prisma
RUN npm ci

FROM base AS build
COPY tsconfig.json .
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY package.json ./
EXPOSE 4000
CMD ["node", "dist/index.js"]
