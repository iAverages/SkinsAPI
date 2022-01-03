FROM node:16

RUN mkdir -p /usr/src/app && \
    chown node:node /usr/src/app

USER node:node

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm install

ENV PORT=3000
ENV MONGO_URI=mongodb://localhost/skins_api

EXPOSE ${PORT}
STOPSIGNAL SIGINT

CMD ["npm", "start"]