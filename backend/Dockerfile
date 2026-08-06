# syntax=docker/dockerfile:1

# Build stage - Go 1.24
FROM golang:1.24-bullseye AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
RUN go build -o /server

# Runtime stage
FROM debian:11-slim

WORKDIR /

COPY --from=build /server /server

RUN apt-get update && \
    apt-get install -y ca-certificates && \
    apt-get clean

EXPOSE 8080

USER nobody

ENTRYPOINT ["/server"]
