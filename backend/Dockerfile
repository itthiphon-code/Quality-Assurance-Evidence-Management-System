# QA-EMS backend — production image
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
COPY backend/prisma ./backend/prisma
RUN npm install --workspace backend
COPY backend ./backend
RUN npm run build --workspace backend
RUN npx --prefix backend prisma generate --schema=backend/prisma/schema.prisma

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma
COPY backend/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/server.js"]
