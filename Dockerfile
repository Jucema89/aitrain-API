# Etapa de instalacion de dependencias
FROM node:20-alpine as deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm install

# Etapa de construcción para compilar la aplicación
FROM node:20-alpine as builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

COPY . .

RUN npx prisma generate

RUN npm run build

# Etapa final para ejecutar la aplicación
FROM node:20-alpine as runner
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma
RUN mkdir /app/uploads /app/trainers

RUN npx prisma generate

CMD [ "npm", "run", "start:docker" ]