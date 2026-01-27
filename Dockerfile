# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# IMPORTANT: Cache bust arg - Dokploy should pass current timestamp
# This invalidates all layers after this point
ARG CACHEBUST=1

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Force fresh code pull - this MUST come BEFORE the COPY command
# The ARG invalidates Docker cache for all subsequent layers
RUN echo "Cache bust: ${CACHEBUST}"

# Copy source code (this layer will now be rebuilt every time)
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
