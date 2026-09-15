FROM ghcr.io/voidzero-dev/vite-plus:latest AS build
WORKDIR /build
COPY --chown=vp:vp package.json package-lock.json ./
RUN vp install
COPY tsconfig.json vite.config.ts ./
COPY ./source ./source
RUN vp run build && vp pm pack

FROM ubuntu:24.04 AS ubuntu
SHELL ["/bin/bash", "-c"]
RUN useradd -m user
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -fsSL https://vite.plus | bash

ENV PATH="/root/.local/share/vite-plus/bin:${PATH}"
WORKDIR /home/user
COPY --from=build /build/*.tgz ./package.tgz

CMD [ "vpx", "./package.tgz" ]
