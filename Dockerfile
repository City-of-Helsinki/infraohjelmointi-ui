# ===============================================
FROM alpine
# ===============================================
WORKDIR /app
# Copy all files
COPY . .

ENV YARN_VERSION 1.22.19

# Changing ownership and user rights to support following use-cases:
# 1) running container on OpenShift, whose default security model
#    is to run the container under random UID, but GID=0
# 2) for working root-less container with UID=1001, which does not have
#    to have GID=0
# 3) for default use-case, that is running container directly on operating system,
#    with default UID and GID (1001:0)
# Supported combinations of UID:GID are thus following:
# UID=1001 && GID=0
# UID=<any>&& GID=0
# UID=1001 && GID=<any>
RUN apk add --update nginx nodejs yarn && \
  rm -rf /var/cache/apk/* && \
  chown -R 1001:0 /var/lib/nginx /var/log/nginx /run && \
  chmod -R ug+rwX /var/lib/nginx /var/log/nginx /run && \
  yarn policies set-version $YARN_VERSION && \
  # Install dependencies
  yarn install && yarn build && \
  cp -r /app/build /usr/share/nginx/html && \
  # Copy nginx config
  cp /app/nginx.conf /etc/nginx/nginx.conf


EXPOSE 4000
# start nginx service
USER 1001
CMD ["nginx", "-g", "daemon off;"]
