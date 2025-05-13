#!/bin/sh

YELLOW="\033[1;33m"
GREEN="\033[1;32m"
RED="\033[1;31m"
NC="\033[0m"

log() {
echo -e "${GREEN}LOG: $1 ${NC}"
}

warn() {
echo -e "${YELLOW}WARN: $1 ${NC}"
}

error() {
echo -e "${RED}ERROR: $1 ${NC}"
}


log "Cleaning up previous build artifacts"
rm -rf $(pwd)/.next $(pwd)/node_modules $(pwd)/package/node_modules && hash -r || error "Failed to clean previous build artifacts."

log "Updating package lists and upgrading existing packages"
apt-get upgrade -y && apt-get update -y && apt-get install -y aptitude && hash -r || error "Failed to update and upgrade packages."

log "Installing essential tools"
aptitude install -y build-essential pkg-config git curl wget ffmpeg opus-tools unzip nginx && hash -r || error "Failed to install essential tools."

log "Performing autoremove to clean up unnecessary packages"
apt-get -y autoremove && hash -r || warn "Autoremove did not complete successfully."

if ! command -v node &> /dev/null; then
  log "Installing Node.js and npm"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && hash -r || error "Failed to add Node.js repository."
  aptitude install -y nodejs && hash -r || error "Failed to install Node.js."
  apt-get -y autoremove && hash -r || warn "Autoremove did not complete successfully."
else
  log "Node.js and npm already installed. Skipping installation."
fi

log "Installing global npm & yarn Node.js packages"
npm install --global npm bun yarn && hash -r || error "Failed to install npm global Node.js packages."
yarn global add pm2 forever yt-core && hash -r || error "Failed to install yarn global Node.js packages."
apt-get -y autoremove && hash -r || warn "Autoremove did not complete successfully."

log "Running 'yarn install'"
yarn install || error "'yarn install' failed."
yarn build || error "'yarn build' failed."
log "Setup completed successfully!"