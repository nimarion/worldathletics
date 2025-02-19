FROM node:20-bookworm-slim AS base
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

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
RUN apt-get update -y && apt-get install -y openssl
EXPOSE 8000
CMD [ "pnpm", "start" ]