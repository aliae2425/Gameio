# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install server dependencies first (layer cache)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy server source and client game logic (server imports from these)
COPY server/ ./server/
COPY client/src/games/ ./client/src/games/

# Compile TypeScript + rewrite path aliases to relative requires
RUN cd server && npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/server/dist ./dist

EXPOSE 8000
CMD ["node", "dist/server/src/index.js"]
