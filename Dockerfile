FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

ENV PORT=8000

EXPOSE 8000

CMD ["npm", "start"]