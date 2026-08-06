# syntax=docker/dockerfile:1

# Build stage - Go 1.23 (latest available on Docker Hub)
FROM golang:1.23-bullseye AS build

RUN apt-get update && apt-get install -y gcc sqlite3 libsqlite3-dev ca-certificates && update-ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
ENV CGO_ENABLED=1
RUN go build -o /server

# Runtime stage
FROM debian:11-slim

WORKDIR /

COPY --from=build /server /server

RUN apt-get update && \
    apt-get install -y libsqlite3-0 ca-certificates && \
    apt-get clean

EXPOSE 8080

USER nobody

ENTRYPOINT ["/server"]
