FROM alpine:3.7

RUN apk add --update build-base

WORKDIR /usr/src/sandbox