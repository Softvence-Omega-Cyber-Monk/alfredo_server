FROM node:20.11.1-alpine

RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  gcc \
  su-exec \
  && ln -sf python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN mkdir -p uploads

RUN npx prisma generate

RUN npm run build

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

# Create entrypoint script that fixes volume permissions at runtime
RUN printf '#!/bin/sh\nchown -R appuser:appgroup /app/uploads 2>/dev/null || true\nsu-exec appuser "$@"\n' > /app/entrypoint.sh \
  && chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "run", "start:migrate:prod"]