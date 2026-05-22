FROM node:20-slim

# Install zsign build dependencies + runtime libs
RUN apt-get update && apt-get install -y \
    build-essential cmake libssl-dev libzip-dev git ca-certificates \
    && git clone --depth 1 https://github.com/zhlynn/zsign.git /tmp/zsign \
    && cd /tmp/zsign && cmake . && make \
    && cp zsign /usr/local/bin/zsign \
    && rm -rf /tmp/zsign \
    && apt-get purge -y build-essential cmake git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
COPY patches/ ./patches/

RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

COPY . .
RUN pnpm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]
