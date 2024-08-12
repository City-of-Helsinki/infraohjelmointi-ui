# ===============================================
# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy all files to the container
COPY . .

# Install nginx and other necessary packages
RUN apt-get update && apt-get install -y \
  nano nginx bash && \
  rm -rf /var/lib/apt/lists/* && \
  chown -R 1001:0 /var/lib/nginx /var/log/nginx /run && \
  chmod -R ug+rwX /var/lib/nginx /var/log/nginx /run

# Set the Yarn version
ENV YARN_VERSION 1.22.19

# Install dependencies with Yarn
RUN yarn set version $YARN_VERSION && \
  yarn install && \
  yarn build && \
  cp -r /app/build /usr/share/nginx/html && \
  # Copy nginx config
  cp /app/nginx.conf /etc/nginx/nginx.conf

# Expose the port nginx is reachable on
EXPOSE 4000

# Define the running user
USER 1001

# Specify the entrypoint script to start nginx
ENTRYPOINT ["./docker-entrypoint.sh"]
