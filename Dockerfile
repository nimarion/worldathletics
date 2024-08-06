FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-bookworm-slim

ARG BRANCH="main"
ARG COMMIT=""
LABEL branch=${BRANCH}
LABEL commit=${COMMIT}

ENV COMMIT_SHA=${COMMIT}
ENV COMMIT_BRANCH=${BRANCH}

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# RUN apt-get update && apt-get install -y curl jq
# HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 CMD [ "curl -m 5 --silent --fail --request GET http://localhost:3000/health | jq --exit-status -n 'inputs | if has("status") then .status=="ok" else false end' > /dev/null || exit 1" ]

EXPOSE 3000

CMD [  "npm", "run", "start:prod" ]