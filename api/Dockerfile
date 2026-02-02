FROM node:20-alpine

WORKDIR /app

# Ensure database directory exists
RUN mkdir -p /app/database

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install --force

COPY . .

EXPOSE 4000

# Run in dev mode for hot reloading
CMD ["npm", "run", "dev"]
