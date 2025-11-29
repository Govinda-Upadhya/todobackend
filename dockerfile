FROM node:22-alpine

WORKDIR /app/backend

COPY ./package*.json .

RUN npm install 

COPY . .

ARG DATABASE_URL

RUN npx prisma generate && npm run build

EXPOSE 3000

CMD [ "npm", "run", "dev:final" ]



