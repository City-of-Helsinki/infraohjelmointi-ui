# ===============================================
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.4
# ===============================================
WORKDIR /app

# Set environment variables
ENV YARN_VERSION=1.22.19
ENV NODE_VERSION=18.x

# Install necessary packages using curl-minimal
RUN microdnf update -y && \
  microdnf install -y \
  tar \
  gzip \
  bash \
  && curl -sL https://rpm.nodesource.com/setup_18.x | bash - && \
  microdnf install -y \
  nodejs \
  nginx \
  nano \
  && microdnf clean all

# Install Yarn manually
RUN curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version $YARN_VERSION && \
  ln -s /root/.yarn/bin/yarn /usr/local/bin/yarn

# Changing ownership and user rights to support following use-cases:
RUN chown -R 1001:0 /var/lib/nginx /var/log/nginx /run && \
  chmod -R ug+rwX /var/lib/nginx /var/log/nginx /run

# Install node dependencies and build the project
COPY . .
RUN yarn install && yarn build && \
  cp -r /app/build/* /usr/share/nginx/html/ && \
  cp /app/nginx.conf /etc/nginx/nginx.conf

# Expose port 4000
EXPOSE 4000

# Run the container as the non-root user
USER 1001

# Start nginx service
ENTRYPOINT ["./docker-entrypoint.sh"]