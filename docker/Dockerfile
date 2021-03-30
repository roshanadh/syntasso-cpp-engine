FROM node:14.16.0-alpine3.13

RUN apk add --update build-base 

COPY client-files/wrapper-programs/. /usr/src/sandbox

WORKDIR /usr/src/sandbox