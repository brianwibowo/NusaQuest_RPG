FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
