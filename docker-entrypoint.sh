#!/bin/bash

set -e

if [[ "$DEV_SERVER" = "true" ]]; then
    # Skip lifecycle scripts: the "prepare" git-hook setup needs git, which the image lacks.
    yarn install --ignore-scripts && yarn start
else
    nginx -g "daemon off;"
fi