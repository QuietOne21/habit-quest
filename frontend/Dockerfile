# ══════════════════════════════════════════
# STAGE 1 — Build the React app
# ══════════════════════════════════════════
FROM node:20-alpine AS build
# "AS build" gives this stage a name
# Stage 2 will reference it by this name

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
# Allows us to configure the API URL at build time
# Default is empty string (nginx proxies /api/ requests)
ARG REACT_APP_API_URL=""
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React app
# Creates a "build" folder with optimised static files
# All JSX is compiled to plain JavaScript
# All CSS is minified
# All imports are bundled into single files
RUN npm run build

# ══════════════════════════════════════════
# STAGE 2 — Serve with nginx
# ══════════════════════════════════════════
FROM nginx:alpine AS serve
# nginx:alpine = tiny web server (~23MB)

# Copy ONLY the compiled build output from Stage 1
# The entire Node.js environment is left behind
# This keeps the final image small and secure
COPY --from=build /app/build /usr/share/nginx/html

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 80 is the standard HTTP port
EXPOSE 80

# Start nginx in the foreground
# "daemon off" keeps nginx running (Docker needs this)
CMD ["nginx", "-g", "daemon off;"]