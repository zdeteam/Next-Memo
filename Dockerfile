# Build frontend dist.
FROM node:16.15.0-alpine AS frontend
WORKDIR /frontend-build

COPY ./web/ .

RUN yarn
RUN yarn build

# Build backend exec file.
FROM golang:1.18.3-alpine3.16 AS backend
WORKDIR /backend-build

RUN apk update
RUN apk --no-cache add gcc musl-dev

COPY . .
COPY --from=frontend /frontend-build/dist ./server/dist

RUN go build \
    -o open-flomo \
    ./bin/server/main.go

# Make workspace with above generated files.
FROM alpine:3.16.0 AS monolithic
WORKDIR /usr/local/open-flomo

COPY --from=backend /backend-build/open-flomo /usr/local/open-flomo/

# Directory to store the data, which can be referenced as the mounting point.
RUN mkdir -p /var/opt/open-flomo

ENTRYPOINT ["./open-flomo"]
