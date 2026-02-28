FROM node:20.11.1-alpine

RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  gcc \
  && ln -sf python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN mkdir -p uploads

RUN npx prisma generate

RUN npm run build

# ✅ Add this — don't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

CMD ["npm", "run", "start:migrate:prod"]