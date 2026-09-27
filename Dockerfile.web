# ==============================================================================
# Dockerfile Frontend Web — Nexus HRIS (Next.js 14 App Router + Tailwind)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

RUN npm ci

COPY frontend ./frontend

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=frontend

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/package.json ./frontend/package.json

WORKDIR /app/frontend

EXPOSE 3001

CMD ["npm", "run", "start"]

