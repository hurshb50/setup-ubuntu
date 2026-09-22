FROM ghcr.io/voidzero-dev/vite-plus:latest AS build
WORKDIR /build
COPY --chown=vp:vp package.json package-lock.json ./
RUN vp install
COPY --parents tsconfig.json vite.config.ts assets source ./
RUN vp run build && vp pm pack

FROM ubuntu:24.04 AS ubuntu
SHELL ["/bin/bash", "-c"]
ENV SHELL=/bin/bash
RUN useradd -m -s /bin/bash user

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates sudo

RUN echo 'user ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/user && \
    chmod 0440 /etc/sudoers.d/user

USER user
RUN curl -fsSL https://vite.plus | bash
ENV PATH="/home/user/.local/share/vite-plus/bin:${PATH}"
WORKDIR /home/user
COPY --from=build --chown=user:user /build .
RUN mv *.tgz package.tgz

CMD [ "vpx", "./package.tgz" ]
