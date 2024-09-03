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
    curl --proto "=https" --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && \
    microdnf install -y yum && \
    # microdnf module enable -y nodejs && \
    yum install -y nano nginx nodejs yarn && \
    yum clean all && \
    rm -rf /var/cache/yum && \
    mkdir -p /.cache/yarn /.npm /.yarn
    
# Change ownership and permissions
RUN chown -R 1001:0 /.cache/yarn /.npm /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx /.yarn && \
    chmod -R ug+rwX /.cache/yarn /.npm /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx /.yarn

# Copy nginx file and change file owner and permissions
COPY --chown=1001:0 nginx.conf /etc/nginx/nginx.conf
RUN chown -R 1001:0 /etc/nginx/nginx.conf && \
    chmod -R ug+rwX /etc/nginx/nginx.conf

# Use default user '1001' to install packages and copy files
USER 1001

WORKDIR /app

COPY --chown=1001:0 --chmod=755 yarn.lock .
COPY --chown=1001:0 --chmod=755 package.json .

RUN yarn install --frozen-lockfile && \
    npx update-browserslist-db@latest

RUN yarn policies set-version $YARN_VERSION

COPY --chown=1001:0 --chmod=755 ./public ./public
COPY --chown=1001:0 --chmod=755 ./src ./src
COPY --chown=1001:0 --chmod=755 ./craco.config.js .
COPY --chown=1001:0 --chmod=755 ./docker-entrypoint.sh .
COPY --chown=1001:0 --chmod=755 ./sonar-project.properties .
COPY --chown=1001:0 --chmod=755 ./tsconfig* .
COPY --chown=1001:0 --chmod=755 ./.eslintrc.json .
COPY --chown=1001:0 --chmod=755 ./.env.development .
COPY --chown=1001:0 --chmod=755 ./.env.production .

# Build application
RUN yarn build

# Change ownership and permissions so the files can be replaced with app's files
USER root
RUN rm -rf /usr/share/nginx/html/* && \
    chown -R 1001:0 /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx && \
    chmod -R ug+rwX /run /usr/share/nginx/html /var/lib/nginx /var/log/nginx 

# We make sure we will entry with the user 1001
USER 1001

RUN cp -r /app/build/* /usr/share/nginx/html/

EXPOSE 4000

# Start nginx service
ENTRYPOINT ["./docker-entrypoint.sh"]
