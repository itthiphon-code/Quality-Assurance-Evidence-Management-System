# QA-EMS frontend — production image (built static assets served by Nginx)
FROM node:20-alpine AS builder
WORKDIR /app
# Vite inlines env vars at build time, not runtime — default to a same-origin relative path
# since Nginx (see nginx/nginx.conf) proxies /api/* to the backend container on the same host.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/package.json
RUN npm install --workspace frontend
COPY frontend ./frontend
RUN npm run build --workspace frontend

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
