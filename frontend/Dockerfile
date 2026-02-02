FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

# Run Vite dev server, exposed to host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
