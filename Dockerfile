FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY .docker_env ./.env

COPY *.js ./

CMD [ "node", "insert_punches.js" ]
