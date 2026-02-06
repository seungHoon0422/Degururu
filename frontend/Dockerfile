FROM node:20-slim AS builder

WORKDIR /app

# Build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim

WORKDIR /app

# Install vite globally to ensure 'vite preview' works, or use npx
RUN npm install -g vite

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# Use npx to ensure the local or global vite binary is found
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
