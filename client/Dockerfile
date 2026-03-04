# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY client/package*.json ./
RUN npm ci

COPY client/ ./

# URL du serveur boardgame.io — doit être accessible depuis le navigateur du joueur
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist
WORKDIR /app

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
