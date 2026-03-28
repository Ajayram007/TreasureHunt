FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Backend runs on 3000 internally
EXPOSE 3000

CMD ["npm", "start"]
