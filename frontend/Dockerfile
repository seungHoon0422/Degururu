FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# We use vite preview for simple deployment demonstration
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
