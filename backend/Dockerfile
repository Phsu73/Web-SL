# syntax=docker/dockerfile:1

# ✅ Build stage with modern Go version
FROM golang:1.24-bullseye AS build

RUN apt-get update && apt-get install -y gcc sqlite3 libsqlite3-dev ca-certificates && update-ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
ENV CGO_ENABLED=1
RUN go build -o /server

# ✅ Runtime stage with matching glibc
FROM debian:11-slim

WORKDIR /

COPY --from=build /server /server

RUN apt-get update && \
    apt-get install -y libsqlite3-0 ca-certificates && \
    apt-get clean

EXPOSE 8080

USER nobody

ENTRYPOINT ["/server"]
