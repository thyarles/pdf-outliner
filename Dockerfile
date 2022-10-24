FROM node:18-alpine

WORKDIR /app
COPY . .

RUN apk update \
 && apk add curl ghostscript poppler-utils py3-img2pdf \
 && chown node:node -R /app \
 && yarn deploy:prod

USER node
EXPOSE 3000

CMD ["yarn", "prod"]
