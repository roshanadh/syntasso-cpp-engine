FROM docker:20.10.5-dind

RUN apk add --update npm redis bash

RUN mkdir -p /usr/src/app

COPY . /usr/src/app/.

WORKDIR /usr/src/app/

RUN echo -e "PORT=8082\nCLIENT_PROTOCOL=http\nCLIENT_HOST=127.0.0.1\nCLIENT_PORT=33699\nSECRET_SESSION_KEY=12354abcd\nREDIS_STORE_HOST=localhost\nREDIS_STORE_PORT=6379\nEXECUTION_TIME_OUT_IN_MS=2000\nMAX_LENGTH_STDOUT=2000" >> .env

RUN npm install

EXPOSE 8082

# docker build -t img_cpp_engine .

# docker run --privileged --name cont_cpp_engine -d -e DOCKER_TLS_CERTDIR=/certs -v cont_cpp_engine_certs_ca:/certs/ca -v cont_cpp_engine_certs_client:/certs/client -p 8082:8082 img_cpp_engine

# docker exec -it cont_cpp_engine sh -c "redis-server --daemonize yes && npm test"