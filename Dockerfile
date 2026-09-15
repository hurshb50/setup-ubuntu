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
WORKDIR /home/user
RUN apt-get update
RUN apt-get install -y --no-install-recommends curl ca-certificates
RUN curl -fsSL https://vite.plus | bash
RUN rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/share/vite-plus/bin:${PATH}"

COPY --from=build /build/*.tgz ./package.tgz

CMD [ "vpx", "./package.tgz" ]
