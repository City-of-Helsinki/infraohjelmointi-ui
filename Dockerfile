# ===============================================
FROM alpine
# ===============================================
WORKDIR /app
# Copy all files
COPY . .

ENV YARN_VERSION 1.22.19

RUN apk add --update nginx nodejs yarn && \
  rm -rf /var/cache/apk/* && \
  chown -R nginx:www-data /var/lib/nginx && \
  yarn policies set-version $YARN_VERSION && \
  # Install dependencies
  yarn install && yarn build && \
  cp -r /app/build /usr/share/nginx/html && \
  # Copy nginx config
  cp /app/nginx.conf /etc/nginx/nginx.conf


EXPOSE 4000
# start nginx service
CMD ["nginx", "-g", "daemon off;"]
