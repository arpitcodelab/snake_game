# Use a lightweight Node.js image for the static server
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy all project files to the container's working directory
COPY . .

# Render will supply a PORT environment variable, but we can set a fallback
ENV PORT=10000

# Expose the port (mostly for documentation/local running, Render maps this automatically)
EXPOSE $PORT

# Start the Node.js static server
CMD ["node", "server.js"]
