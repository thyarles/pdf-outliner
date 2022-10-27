FROM node:18

WORKDIR /app
COPY . .

RUN apt-get update \
 && apt-get install  -y curl ghostscript poppler-utils img2pdf \
 && chown node:node -R /app \
 && yarn deploy:prod

USER node
EXPOSE 3000

CMD ["yarn", "prod"]
