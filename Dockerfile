# ===============================================
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.4
# ===============================================

ENV YARN_VERSION 1.22.19

# Use user 'root' to add missing microdnf and ym packages
USER root

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

# Import Yarn GPG key and add the repository
RUN rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg && \
    curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && \
    microdnf install -y yum && \
    microdnf module enable -y nodejs:18 && \
    yum install -y nano nginx yarn && \
    yum clean all && \
    rm -rf /var/cache/yum && \
    mkdir -p /.cache/yarn /.npm /.yarn

# Change ownership and permissions
RUN chown -R 1001:0 /.cache/yarn /.npm /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx /.yarn && \
    chmod -R ug+rwX /.cache/yarn /.npm /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx /.yarn

COPY nginx.conf /etc/nginx/nginx.conf

# Use default user '1001' to install packages and copy files
USER 1001

WORKDIR /app

COPY --chown=1001:0 package.json yarn.lock .

RUN yarn install && \
    npx update-browserslist-db@latest

RUN yarn policies set-version $YARN_VERSION

COPY --chown=1001:0 . .

# Build application
RUN yarn build && \
    cp -r /app/build /usr/share/nginx/html

# Change ownership and permissions
RUN chown -R 1001:0 /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx && \
    chmod -R ug+rwX /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx

EXPOSE 4000

# Start nginx service
ENTRYPOINT ["./docker-entrypoint.sh"]
