# ==========================================
# Phase 1: Build static React files (Vite)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Phase 2: Serve static files via Nginx
# ==========================================
FROM nginx:stable-alpine

# Copy custom nginx configuration if needed, or use default static serving
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
