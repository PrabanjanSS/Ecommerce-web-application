# Use the official Node.js Alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Install ALL dependencies (including devDependencies like nodemon)
RUN npm install

# Copy the rest of your backend source code
COPY . .

# Expose the port your Express server runs on
EXPOSE 5000

# Use 'npm run dev' instead of 'npm start' to utilize nodemon for hot-reloading
CMD ["npm", "run", "dev"]