FROM node:18-alpine

WORKDIR /app
COPY . .

RUN apk update \
 && apk add curl ghostscript \
 && mkdir /efs \
 && chown node:node -R /app /efs \
 && yarn deploy:prod

USER node
EXPOSE 3000
VOLUME /efs

CMD ["yarn", "prod"]
