# ===============================================
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.4
# ===============================================
WORKDIR /app

# Set environment variables
ENV YARN_VERSION=1.22.19
ENV NODE_VERSION=18.x

# Install necessary packages, Node.js, Yarn, and change ownership and user rights
RUN microdnf update -y && \
  microdnf install -y \
  tar \
  gzip \
  bash \
  nano && \
  microdnf clean all && \
  microdnf install -y nginx && \
  microdnf clean all && \
  chown -R 1001:0 /var/lib/nginx /var/log/nginx /run && \
  chmod -R ug+rwX /var/lib/nginx /var/log/nginx /run

# Add the NodeSource setup script and install Node.js
ADD https://rpm.nodesource.com/setup_18.x /tmp/setup_18.x
RUN bash /tmp/setup_18.x && rm /tmp/setup_18.x && \
  microdnf install -y nodejs && \
  microdnf clean all

# Add the Yarn installation script and install Yarn
ADD https://yarnpkg.com/install.sh /tmp/install-yarn.sh
RUN bash /tmp/install-yarn.sh --version "$YARN_VERSION" && \
  ln -s /root/.yarn/bin/yarn /usr/local/bin/yarn && \
  rm /tmp/install-yarn.sh

# Install node dependencies and build the project
COPY . .
RUN yarn install --ignore-scripts && yarn build && \
  cp -r /app/build/* /usr/share/nginx/html/ && \
  cp /app/nginx.conf /etc/nginx/nginx.conf

# Expose port 4000
EXPOSE 4000

# Run the container as the non-root user
USER 1001

# Start nginx service
ENTRYPOINT ["./docker-entrypoint.sh"]