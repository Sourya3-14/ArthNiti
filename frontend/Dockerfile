# ==========================================
# Multi-stage Dockerfile for Frontend (Vite + React 19)
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json ./

# Install npm dependencies
RUN npm ci

# Build-time environment variables for Vite
# (Vite bakes VITE_* variables into bundle at build time)
ARG VITE_API_URL=""
ARG VITE_AI_API_URL=""
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy project files and build
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Remove default nginx static assets and config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

