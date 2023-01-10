#!/bin/bash

set -e

if [[ "$DEV_SERVER" = "true" ]]; then
    yarn start
else
    nginx -g daemon off;
fi