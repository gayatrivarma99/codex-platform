FROM node:22-alpine

# Install Python, gcc/g++, openjdk for multi-language execution
RUN apk add --no-cache python3 g++ openjdk17 make

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5050

CMD ["node", "src/executionServer.js"]
