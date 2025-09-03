FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Using npm ci for faster, more reliable builds in CI/CD environments
RUN npm ci

COPY . .

# Expose both the HTTP and P2P ports
EXPOSE 3001 5001

CMD ["npm", "start"]