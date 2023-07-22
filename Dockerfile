FROM node:20.3.0-alpine

ARG APP

RUN apk add --no-cache tini

WORKDIR /app
# Copy package.json files from examples and core directories
COPY Examples/Example_${APP}/package.json ./
RUN npm install

# Copy remaining files
COPY Examples/Example_${APP} ./
COPY Examples/utils/S3 ./S3
COPY bin ./core
