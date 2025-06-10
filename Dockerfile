# TravelMate AI Chatbot - Flow Manager
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy flow management script
COPY manage_flow.py .

# Set environment variables
ENV LANGFLOW_HOST=http://langflow:8080
ENV FLOW_FILE_PATH=/app/TravelMate.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f ${LANGFLOW_HOST}/api/v1/health || exit 1

# Run the flow management script
CMD ["python", "manage_flow.py"]
