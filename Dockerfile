FROM node:14.19.0-stretch-slim

RUN mkdir -p /usr/src/app
RUN mkdir -p /data

RUN chown -R 1000:1000 /data

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -yq \
        ca-certificates \
        fonts-liberation \
        gconf-service \
        libappindicator1 \
        libappindicator3-1 \
        libasound2 \
        libatk1.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgcc1 \
        libgconf-2-4 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        lsb-release \
        xdg-utils wget
RUN apt-get install libfontconfig -y
RUN npm install

COPY . .

ENV FLAVOR $FLAVOR
ENV CERT_FOLDER $CERT_FOLDER
ENV MONGO_DB "afip1"
ENV DATABASE_NAME $DATABASE_NAME
ENV AFIP_CUIT $AFIP_CUIT
ENV VERSION "api/v1"
ENV API_PUBLIC  "9fuj901dsn239hfg24jg2804gj9134f9'3gj8935jg89104u3hf9k'1d8305yuhdh732y1d893en1803j81fg3"
ENV TOKEN_SECRET  "89crn2823894r8nymrcnyfn9'1'xk,r1978239f139jf"
ENV MONGO_USER "gary"
ENV MONGO_CONNECT "vegvisir1997"

EXPOSE $PORT

CMD ["npm", "run", "start"]
