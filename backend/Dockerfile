# Sử dụng Node.js bản stable
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --production

# Copy toàn bộ mã nguồn backend
COPY . .

# Mở cổng 5000 (theo code trong index.js)
EXPOSE 5000

# Chạy server
CMD ["node", "index.js"]
