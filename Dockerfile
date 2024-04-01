# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-slim as base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

ENV NODE_ENV="production"

ADD server server
ADD public public

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "server/index.ts" ]