FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the development server with the host flag we added earlier
CMD ["npm", "run", "dev"]