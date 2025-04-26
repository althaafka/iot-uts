FROM node:18

WORKDIR /app

COPY package*.json ./
COPY .env ./

RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "start"]
