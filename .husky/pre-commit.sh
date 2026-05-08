#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

# Run full repository linting (frontend + backend) using root config
npx eslint . --ext .js,.jsx,.ts,.tsx --config ./eslint.config.js || true
