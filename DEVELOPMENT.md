# Development

## Prerequisites

If you are working on making changes to Supaglue you can use the `docker-compose.override.yml` file to mount your local filesystem into the docker containers and develop with hot-reloading:

```shell
cp docker-compose.override.sample.yml docker-compose.override.yml
```

Also, install dependencies:

```shell
yarn install
```

## Generating grpc clients

```shell
brew install bufbuild/buf/buf
yarn gen:grpc
```

## Serving the docs locally

```shell
yarn workspace docs start
```
