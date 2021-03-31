# Syntasso

## C++ Compilation and Execution Engine [![Build Status](https://travis-ci.com/roshanadh/syntasso-cpp-engine.svg?token=jtwD19xWMoUy4u3AdP9Q&branch=master)](https://travis-ci.com/roshanadh/syntasso-cpp-engine)

## Usage

-   Clone the repo and change your working directory
    ```sh
    git clone https://github.com/roshanadh/syntasso-cpp-engine.git && cd syntasso-cpp-engine
    ```
-   Install dependencies
    ```sh
    npm install
    ```
-   Create a '.env' file at the root of the project and append environment variables and their values to the file
    ```sh
    touch .env
    ```
-   Run the server
    ```sh
    npm run start:dev
    ```
-   Make requests from the [client](https://github.com/roshanadh/syntasso-cpp-client.git)

## Build with Docker
After cloning the repo and populating the '.env' file, you can start the engine using Docker.
* Build the image from the Dockerfile inside the project repo
    ```sh
    docker build -t img_cpp_engine .
    ```
* Create and run the container in detached mode using the built image
    ```sh
    docker run --privileged --name cont_cpp_engine -d \
    -e DOCKER_TLS_CERTDIR=/certs \
    -v cont_cpp_engine_certs_ca:/certs/ca \
    -v cont_cpp_engine_certs_client:/certs/client \
    -p 8082:8082 img_cpp_engine
    ```
* Start redis-server as a daemon and run the engine server
    ```sh
    docker exec -it cont_cpp_engine sh -c "redis-server --daemonize yes && npm run start:dev"
    ```
* Make requests from the [client](https://github.com/roshanadh/syntasso-cpp-client.git)

**_Check [Syntasso C++ Engine Wiki](https://github.com/roshanadh/syntasso-cpp-engine/wiki) for Engine API references_**
