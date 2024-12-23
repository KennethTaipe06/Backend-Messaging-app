FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Cambiamos el comando para usar el modo desarrollo
CMD [ "npm", "run", "dev" ]
