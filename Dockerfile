FROM node:18-alpine

WORKDIR /app
COPY . .

RUN apk update \
 && apk add curl ghostscript \
 && chown node:node -R /app \
 && yarn deploy:prod

USER node
EXPOSE 3000

CMD ["yarn", "prod"]
