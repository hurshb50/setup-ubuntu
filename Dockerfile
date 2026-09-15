FROM ghcr.io/voidzero-dev/vite-plus:latest AS builder
WORKDIR /setup-ubuntu
COPY --chown=vp:vp package.json package-lock.json ./
RUN vp install
COPY tsconfig.json vite.config.ts ./
COPY ./source ./source
RUN vp run build && vp run pack

FROM ubuntu:24.04
WORKDIR /ubuntu
SHELL ["/bin/bash", "-c"]
COPY --from=builder /setup-ubuntu/*.tgz /tmp/

RUN apt-get update
RUN apt-get install -y --no-install-recommends ca-certificates curl
RUN curl -fsSL https://vite.plus | bash
ENV PATH="/root/.local/share/vite-plus/bin:${PATH}"
RUN . "$HOME/.config/vite-plus/env"
RUN rm -rf /var/lib/apt/lists/*
RUN vp install

CMD [ "vp", "node", "setup-ubuntu.mjs" ]
