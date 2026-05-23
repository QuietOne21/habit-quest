# ── Stage 1: Use Node 20 on minimal Alpine Linux ──
# Alpine is a tiny Linux (5MB vs 900MB for Ubuntu)
# Perfect for containers — fast to download and start
FROM node:20-alpine

# Set the working directory inside the container
# All commands from here run inside /app
WORKDIR /app

# Copy package files FIRST (before the rest of the code)
# WHY? Docker caches each step (called a "layer")
# If package.json has not changed, Docker skips npm install
# This makes rebuilds much faster
COPY package*.json ./

# Install only production dependencies
# --omit=dev skips jest, nodemon etc (not needed in production)
RUN npm ci --omit=dev

# Now copy the rest of the application code
# We do this AFTER npm install so code changes
# do not invalidate the npm cache layer
COPY . .

# Remove the .env file if it was accidentally copied
# Environment variables come from docker-compose.yml instead
RUN rm -f .env

# Run as a non-root user for security
# If an attacker exploits the app, they cannot
# access root files on the host system
USER node

# Tell Docker this container listens on port 5000
# This is documentation — does not actually open the port
# The port mapping happens in docker-compose.yml
EXPOSE 5000

# The command to run when the container starts
# Use node directly (not nodemon) in production
CMD ["node", "server.js"]