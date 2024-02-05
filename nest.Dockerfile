FROM node:18-alpine

ARG DOTENV_FILE
ENV DOTENV_FILE $DOTENV_FILE

WORKDIR /usr/src/app

COPY $DOTENV_FILE  ./.env
COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/main" ]