#!/bin/zsh
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if [ ! -d node_modules ]; then
  echo 'Run npm ci in this folder first.'
  exit 1
fi
npm run dev -- --open
