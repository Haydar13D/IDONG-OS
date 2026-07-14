FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/repositories ./src/repositories
COPY --from=builder /app/worker ./worker

EXPOSE 3000
CMD ["npm", "start"]
