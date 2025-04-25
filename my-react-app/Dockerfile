# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Accept build-time arguments from docker-compose
ARG REACT_APP_API_URL
ARG REACT_APP_WS_URL
ARG REACT_APP_APP_ENV

# Set environment variables for React
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
ENV REACT_APP_APP_ENV=$REACT_APP_APP_ENV

RUN echo "REACT_APP_API_URL=$REACT_APP_API_URL" && \
    echo "REACT_APP_WS_URL=$REACT_APP_WS_URL" && \
    echo "REACT_APP_APP_ENV=$REACT_APP_APP_ENV"

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
