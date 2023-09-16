FROM oven/bun:1.0.2 as BUILD

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY src src
COPY *.env .
COPY tsconfig.json .

ENV NODE_ENV production
CMD ["bun", "src/index.ts"]