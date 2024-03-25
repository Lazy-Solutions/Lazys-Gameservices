FROM node:20.3.0-alpine

ARG APP

RUN apk add --no-cache tini

WORKDIR /app
# Copy package.json files from examples and core directories
COPY App/package.json ./
RUN npm install

WORKDIR /app
# Copy remaining files
COPY App ./
