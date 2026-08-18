# QA-EMS frontend — production image (built static assets served by Nginx)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/package.json
RUN npm install --workspace frontend
COPY frontend ./frontend
RUN npm run build --workspace frontend

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
