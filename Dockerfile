# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Copy package files first (cached unless package.json changes)
COPY package*.json ./

# Install dependencies (cached unless package.json changes)
RUN npm ci

# CRITICAL: Disable Docker cache for source code
# This fetches current git commit hash at build time, ensuring fresh code
ADD "https://api.github.com/repos/mqxerror/pullman/commits/main?per_page=1" /tmp/git-version.json

# Copy source code (this layer rebuilds when git commit changes)
COPY . .

# Build the app with environment variables
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
