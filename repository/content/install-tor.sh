#!/bin/bash
NC="\033[0m" 
RED="\033[0;31m"
CYAN="\033[0;36m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
info() {
  echo -e "${CYAN}[INFO]: $1${NC}"
}
success() {
  echo -e "${GREEN}[SUCCESS]: $1${NC}"
}
error() {
  echo -e "${RED}[ERROR]: $1${NC}"
}
warn() {
  echo -e "${YELLOW}[WARN]: $1${NC}"
}
info "Updating system packages..."-
sudo apt update && sudo apt upgrade -y || { error "System update failed"; exit 1; }
info "Installing Tor and curl..."
sudo apt install -y tor curl || { error "Failed to install Tor or curl"; exit 1; }
TORRC_PATH="/etc/tor/torrc"
SOCKS_LINE="SocksPort 9050"
info "Configuring Tor for SOCKS5 on 127.0.0.1:9050..."
if [ ! -f "$TORRC_PATH.bak" ]; then
  sudo cp "$TORRC_PATH" "$TORRC_PATH.bak"
  info "Backed up original torrc to torrc.bak"
fi
if ! grep -q "$SOCKS_LINE" "$TORRC_PATH"; then
  echo "$SOCKS_LINE" | sudo tee -a "$TORRC_PATH" >/dev/null
  success "Added SocksPort 9050 to torrc"
else
  info "SocksPort 9050 already configured"
fi
info "Restarting Tor service..."
if command -v service &>/dev/null; then
  sudo service tor restart && success "Tor restarted using service"
elif command -v systemctl &>/dev/null; then
  sudo systemctl restart tor && success "Tor restarted using systemctl"
else
  error "Neither 'service' nor 'systemctl' found. Please restart Tor manually."
  exit 1
fi
info "Checking your normal IP..."
IP=$(curl -s https://checkip.amazonaws.com || echo "Unavailable")
info "Checking your Tor IP..."
TOR_IP=$(curl -s --socks5-hostname 127.0.0.1:9050 https://checkip.amazonaws.com || echo "Unavailable")
echo
info "System IP Address: ${YELLOW}$IP${NC}"
info "Tor IP Address: ${YELLOW}$TOR_IP${NC}"
if [ "$IP" != "$TOR_IP" ] && [ "$TOR_IP" != "Unavailable" ]; then
  success "Tor is successfully routing traffic through SOCKS5!"
  success "You Can Now Start Using 'useTor' option in yt-dlx!"
else
  warn "Tor may not be working. Please double-check torrc configuration or test manually."
fi