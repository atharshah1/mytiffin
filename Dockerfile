# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire app directory into the container
COPY . .

# Expose the port that the app will run on
EXPOSE 3000

# Command to run the Node.js app
CMD ["node", "src/server.js"]
