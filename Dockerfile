FROM node:lts-alpine3.20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i && npm cache clean --force

COPY . .

RUN npm run build

RUN npm prune --production

CMD [ "npm", "run", "start"]
