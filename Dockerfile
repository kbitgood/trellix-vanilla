# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-slim as base

LABEL fly_launch_runtime="Bun"

WORKDIR /app

ENV NODE_ENV="production"

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
ADD server server
ADD public public
ADD package.json package.json

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "server/index.ts" ]