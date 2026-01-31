# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 cvbuilder

# Copy package files and install production deps only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server
COPY src/types.ts ./src/types.ts

# Change ownership
RUN chown -R cvbuilder:nodejs /app

USER cvbuilder

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start server
CMD ["npm", "run", "server"]
