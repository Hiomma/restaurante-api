# Multi-stage Dockerfile for NestJS production
# Build stage
FROM node:26-alpine AS builder
WORKDIR /app

# Install build tools required to compile native addons (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN HUSKY=0 npm ci

# Copy source and build
COPY . .
RUN npm run build --silent

# Prune dev dependencies so only production modules are copied over
RUN npm prune --production

# Production stage
FROM node:26-alpine AS runner
WORKDIR /app

# xmllint is required by node-sped-nfe for XML schema validation
# openssl is required by the pem library for certificate operations
RUN apk add --no-cache libxml2-utils openssl

# Copy production node_modules from builder (native bindings already compiled for Linux)
COPY --from=builder /app/node_modules ./node_modules

# Copy built app from builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
