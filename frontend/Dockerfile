FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Convert line endings and make startup script executable
RUN sed -i 's/\r$//' startup.sh && chmod +x startup.sh

# Expose port
EXPOSE 3000

# Start the application with sync
CMD ["./startup.sh"]
