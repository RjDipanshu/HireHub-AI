# =============================================================================
# HireHub AI — Frontend Dockerfile (React + Vite + Nginx)
# Multi-Stage Production Build: Node 20 Builder -> Nginx Alpine Runtime
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Static Production Assets
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Cache package dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Accept build arguments for Vite environment variables
ARG VITE_SUPABASE_URL=https://qbdcvnkomdzqfxevlhhj.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy
ARG VITE_API_BASE_URL=/api/v1

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code and build
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Minimal High-Performance Nginx Web Server
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Remove default nginx welcome site
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
