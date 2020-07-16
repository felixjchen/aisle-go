FROM node:14.2

COPY package.json .
COPY couchdb.js .
COPY app.js .
RUN npm install

CMD node app.js