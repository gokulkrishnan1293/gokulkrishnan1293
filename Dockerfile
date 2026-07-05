FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install a simple HTTP server to serve the built files
RUN npm install -g serve

# Expose port 3015
EXPOSE 3015

# Default command serves the built app
CMD ["serve", "-s", "dist", "-l", "3015"]
