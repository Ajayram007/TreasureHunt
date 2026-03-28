# Stage 1: Build the React Application
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# We inject the backend API URL during the build stage
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Stage 2: Serve the React application using Nginx
FROM nginx:alpine

# Copy the built files from Stage 1 to Nginx's HTML directory
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Create a basic Nginx configuration to support React Router
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    error_page 404 /index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
