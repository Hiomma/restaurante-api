FROM node:26-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN npm prune --production

FROM node:26-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
