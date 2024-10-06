FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i && npm cache clean --force

COPY . .

RUN npm run build

RUN npm prune --production

RUN apk add --no-cache python3 py3-pip

RUN pip install yt-dlp --break-system-packages

CMD [ "npm", "run", "start"]
