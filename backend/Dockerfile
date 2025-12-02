FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY src ./src

# Build TypeScript
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Switch to non-root user (pre-built in node image)
USER node

EXPOSE 8080

CMD ["node", "dist/index.js"]

