# Use Python as the base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port the backend runs on
EXPOSE 8000

# Start the backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]