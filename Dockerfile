FROM node:18-alpine AS client-builder

WORKDIR /app

COPY client/package*.json ./client/
RUN npm install --prefix client

COPY client/ ./client/

RUN npm run build --prefix client

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3001 5001

CMD ["npm", "start"]