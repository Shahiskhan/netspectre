# ─────────────────────────────────────────────────────────────────────────────
# NetSpectre — Security & Networking Toolkit Container
#  Base: Alpine Linux (minimal footprint)
# ─────────────────────────────────────────────────────────────────────────────
FROM alpine:latest

LABEL maintainer="Muhammad Shahis <aliaskk@gmail.com>"
LABEL description="NetSpectre desktop networking and security diagnostics container"

# Install all required tools in one layer to keep image small
RUN apk update && apk add --no-cache \
    # Network scanning
    nmap \
    nmap-scripts \
    # DNS tools (bind-tools = dig, nslookup, host)
    bind-tools \
    # HTTP client
    curl \
    # Ping / traceroute (busybox variants built-in, iputils adds full ping6 etc.)
    iputils \
    traceroute \
    # Whois client
    whois \
    netcat-openbsd \
    # Extra shell utilities
    bash \
    coreutils \
    net-tools \
    && rm -rf /var/cache/apk/*

WORKDIR /workspace

# Keep container alive — Electron will exec commands into it
CMD ["tail", "-f", "/dev/null"]
