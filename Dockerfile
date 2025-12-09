# =============================================================================
# n00menon - Multi-stage Dockerfile
# =============================================================================
# This Dockerfile builds the n00menon demo service with a minimal production
# image using multi-stage builds for optimal size and security.
#
# Usage:
#   docker build -t n00menon .
#   docker run -p 3000:3000 n00menon
#
# Environment variables:
#   PORT - Port to listen on (default: 3000)
#   NODE_ENV - Node environment (default: production)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:24-alpine AS builder

# Enable corepack for pnpm support
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript and prune dev dependencies for production in one layer
RUN pnpm run build && pnpm prune --prod

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM node:24-alpine AS production

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built artifacts and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER nodejs

# Expose the service port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Start the service
CMD ["node", "dist/index.js"]

# -----------------------------------------------------------------------------
# Stage 3: Development (optional)
# -----------------------------------------------------------------------------
FROM node:24-alpine AS development

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy all files for development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

# Use tsx for hot-reload in development
CMD ["pnpm", "run", "dev"]
