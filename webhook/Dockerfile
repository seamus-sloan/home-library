FROM almir/webhook:latest

USER root

# Install git and docker CLI
RUN apk add --no-cache git docker-cli docker-cli-compose

USER webhook

ENTRYPOINT ["/usr/local/bin/webhook"]
