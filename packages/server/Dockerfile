# --- Build stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/server/package.json packages/server/tsconfig.json ./packages/server/
COPY packages/server/prisma ./packages/server/prisma/
COPY packages/server/prisma.config.ts ./packages/server/

# Install all dependencies (including dev for building)
RUN npm ci --workspace=packages/server

# Copy source and build
COPY packages/server/src ./packages/server/src
RUN npm run build --workspace=packages/server

# Generate Prisma client
RUN npx prisma generate --schema=packages/server/prisma/schema.prisma

# --- Production stage ---
FROM node:20-slim AS production

# Install Playwright's Chromium system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libwayland-client0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built output and production dependencies
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/packages/server/prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/package.json ./

# Install Playwright browsers (Chromium only)
RUN npx playwright install chromium

# Create non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
