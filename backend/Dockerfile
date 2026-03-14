FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Create startup script that handles PORT variable
RUN echo '#!/bin/sh\nPORT=${PORT:-8000}\nexec uvicorn app.main:app --host 0.0.0.0 --port $PORT\n' > /app/start.sh && chmod +x /app/start.sh

# Run the application
CMD ["/app/start.sh"]
