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

# Copy custom nginx configuration to support React Router SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
