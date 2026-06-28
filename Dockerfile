FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY . /app
WORKDIR /app
RUN corepack enable
RUN corepack prepare --activate

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN apt-get update -y && apt-get install -y openssl
RUN pnpm run build

FROM base

ARG BRANCH="main"
ARG COMMIT=""
LABEL branch=${BRANCH}
LABEL commit=${COMMIT}

ENV COMMIT_SHA=${COMMIT}
ENV COMMIT_BRANCH=${BRANCH}
ENV PORT=8000

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
RUN apt-get update -y && apt-get install -y openssl
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request('http://localhost:' + (process.env.PORT || 8000) + '/health', { timeout: 2000 }, (res) => { if (res.statusCode === 200) { process.exit(0); } else { process.exit(1); } }); req.on('error', () => process.exit(1)); req.end();"

CMD [ "node", "dist/main.js" ]