FROM node:14.2

COPY package.json .
RUN npm install

COPY secrets.json .
COPY couchdb.js .
COPY app.js .

CMD node app.js