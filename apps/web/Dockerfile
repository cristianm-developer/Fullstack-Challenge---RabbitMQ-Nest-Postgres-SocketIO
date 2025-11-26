# 1. Prepare Stage
FROM node:20 AS prepare
WORKDIR /app

RUN npm install -g turbo@latest
COPY package.json package-lock.json turbo.json .npmrc ./
COPY packages packages
COPY apps apps

RUN turbo prune @repo/web @repo/typescript-config --docker

# 2. Build Stage
FROM node:20 AS builder
WORKDIR /app

COPY --from=prepare /app/out/json/ .
RUN npm install

COPY --from=prepare /app/out/full/ .

ENV NODE_PATH=./node_modules

RUN npm run build

# 3. Production Stage

FROM nginx:stable-alpine AS production

COPY --from=builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


