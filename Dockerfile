# Ulric-X MD Dockerfile
# Multi-stage build for smaller image

FROM node:20-slim AS base
WORKDIR /app

# Install system deps (sharp needs libvips)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libvips-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install deps
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy source
COPY . .

# Create dirs
RUN mkdir -p sessions database logs

# Expose port
EXPOSE 3000

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck (optional)
HEALTHCHECK --interval=60s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/state',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start
CMD ["node", "index.js"]
