# ==============================================================================
# Dockerfile Backend API — Nexus HRIS (NestJS + Prisma + Payroll Engine)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

COPY package.json package-lock.json ./
COPY packages/payroll-engine/package.json ./packages/payroll-engine/
COPY backend/package.json ./backend/

RUN npm ci

COPY packages/payroll-engine ./packages/payroll-engine
RUN npm run build --workspace=packages/payroll-engine

COPY backend/prisma ./backend/prisma
RUN cd backend && npx prisma generate

COPY backend ./backend
RUN cd backend && npx tsc --project tsconfig.build.json

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/payroll-engine ./packages/payroll-engine
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "dist/main"]

