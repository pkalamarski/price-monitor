FROM node:lts-alpine

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk add --no-cache chromium

COPY . ./

RUN npm set unsafe-perm true && \
    npm ci && \
    npm run build

EXPOSE 8080
CMD ["npm", "start"]
