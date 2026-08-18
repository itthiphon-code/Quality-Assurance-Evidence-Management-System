# QA-EMS backend — production image
FROM node:20-slim AS builder
WORKDIR /app
# Prisma's query engine needs libssl at runtime — slim images don't always ship it
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
COPY backend/prisma ./backend/prisma
RUN npm install --workspace backend
COPY backend ./backend
RUN npx --prefix backend prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build --workspace backend

FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/assets ./assets
COPY backend/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/server.js"]
