# --- Build stage ---
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/web/package.json ./packages/web/

RUN npm ci --workspace=packages/web

COPY packages/web ./packages/web
COPY tsconfig.base.json ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build --workspace=packages/web

# --- Production stage ---
FROM nginx:alpine AS production

COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# SPA routing — all non-file requests go to index.html
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
