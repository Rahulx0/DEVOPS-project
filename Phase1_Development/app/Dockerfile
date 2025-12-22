# syntax=docker/dockerfile:1.7-labs

# Base stage for installing dependencies
FROM node:20-alpine AS deps
# Set working directory
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm ci

# Development stage
FROM deps AS dev
# Set environment to development
ENV NODE_ENV=development
# Copy source code
COPY . .
# Expose port for development server
EXPOSE 5173
# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# Build stage
FROM deps AS build
# Set environment to production
ENV NODE_ENV=production

# Firebase env vars for Vite build
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_NVIDIA_API_KEY

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_NVIDIA_API_KEY=$VITE_NVIDIA_API_KEY

# Copy source code
COPY . .
# Build the application
RUN npm run build

# Production stage
FROM nginx:1.27-alpine AS prod
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built application files to nginx serve directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# Expose port 80 for HTTP traffic
EXPOSE 80
# Start nginx server in foreground
CMD ["nginx", "-g", "daemon off;"]
