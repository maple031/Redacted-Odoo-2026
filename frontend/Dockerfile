# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Stage 2: Dev server ──────────────────────────────────────────────────────
# The Vite dev server is intentionally used here (not a production build)
# to keep Docker Compose parity with local development (HMR, same port 5173).
FROM oven/bun:latest AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173

# --host exposes the dev server on 0.0.0.0 so Docker can reach it.
CMD ["bun", "run", "dev", "--host"]
