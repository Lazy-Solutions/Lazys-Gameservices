# Use the official Node.js image with the specified version
FROM node:20.3.0-alpine

# Install Tini, a minimal init system
RUN apk add --no-cache tini

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY ${SERVICE}/ ./

# Set the working directory to the root of the application
WORKDIR /app

# Copy the environment file
COPY .env ./

# Copy the core folder
COPY core/ ./core/

# Copy the shared folder
COPY shared/ ./shared/

# Copy the entry point script (e.g., index.js)
COPY index.js ./
