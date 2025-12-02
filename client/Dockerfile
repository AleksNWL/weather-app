# Stage 1: build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html   # для Vite
# COPY --from=build /app/build /usr/share/nginx/html  # для CRA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
