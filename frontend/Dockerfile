FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Make startup script executable
RUN chmod +x startup.sh

# Expose port
EXPOSE 3000

# Start the application with sync
CMD ["./startup.sh"]
