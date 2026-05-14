# Bước 1: Build ứng dụng React (Vite)
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Bước 2: Sử dụng Nginx để serve static files
FROM nginx:stable-alpine

# Copy file build từ bước 1 vào thư mục của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
