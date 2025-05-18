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
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
info "Adding Keyring To System..."
KEYRING_PATH="/usr/share/keyrings/kali-archive-keyring.gpg"
sudo wget https://archive.kali.org/archive-keyring.gpg -O "$KEYRING_PATH" || { error "Failed To Add Kali Keyring"; exit 1; }
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
info "Updating System Packages..."
sudo apt update && sudo apt upgrade -y || { error "System Update Failed"; exit 1; }
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
info "Installing Nodejs..."
ROOT_HOME="/root"
FNM_INSTALL_PATH="$ROOT_HOME/.local/share/fnm"
if ! command -v fnm &>/dev/null; then
    info "Installing Fnm (Fast Node Manager)..."
    curl -o- https://fnm.vercel.app/install | bash
    info "Adding Fnm Path ($FNM_INSTALL_PATH) To Current Script's Environment..."
    export PATH="$FNM_INSTALL_PATH:$PATH"
    success "Fnm Path Added To Environment."
    if command -v fnm &>/dev/null; then
        info "Sourcing Fnm Environment For Script..."
        eval "$(fnm env)" || { error "Failed To Source Fnm Environment After Path Update."; exit 1; }
        success "Fnm Environment Sourced."
    else
        error "Fnm Command Not Found After Adding Standard Install Path ($FNM_INSTALL_PATH). Fnm Installation May Have Failed Or Installed To A Different Location."
        exit 1
    fi
else
    info "Fnm Already Installed."
    info "Sourcing Existing Fnm Environment..."
    eval "$(fnm env)" || { error "Failed To Source Existing Fnm Environment."; exit 1; }
    success "Fnm Environment Sourced."
fi
info "Installing Node.Js Version 22 Using Fnm..."
fnm install 22 || { error "Failed To Install Node.Js 22 With Fnm"; exit 1; }
fnm use 22 || { error "Failed To Set Node.Js 22 As Default With Fnm"; exit 1; }
info "Installing Npm And Nodejs Via Apt (For System Integration/Dependencies)..."
sudo apt install -y npm nodejs || { error "Failed To Install Npm Or Nodejs Via Apt"; exit 1; }
success "Nodejs And Npm Installed Successfully."
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
info "Installing Python 3 And Pip..."
sudo apt install -y python3 python3-pip || { error "Failed To Install Python 3 Or Pip"; exit 1; }
success "Python 3 And Pip Installed Successfully."
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
info "Running Autoremove To Clean Up Unused Dependencies..."
sudo apt autoremove -y || { warn "Autoremove failed. Manual cleanup might be required."; }
success "Autoremove completed."
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
info "Installing Tor, Curl, And Unzip..."
sudo apt install -y tor curl unzip || { error "Failed To Install Tor, Curl, Or Unzip"; exit 1; }
success "Tor, Curl, And Unzip Installed Successfully."
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
TORRC_PATH="/etc/tor/torrc"
SOCKS_LINE="SocksPort 9050"
info "Configuring Tor For Socks5 On 127.0.0.1:9050..."
if [ ! -f "$TORRC_PATH.bak" ]; then
  sudo cp "$TORRC_PATH" "$TORRC_PATH.bak"
  info "Backed Up Original Torrc To Torrc.Bak"
fi
if ! grep -q "$SOCKS_LINE" "$TORRC_PATH"; then
  echo "$SOCKS_LINE" | sudo tee -a "$TORRC_PATH" >/dev/null
  success "Added SocksPort 9050 To Torrc"
else
  info "SocksPort 9050 Already Configured"
fi
info "Restarting Tor Service..."
if command -v service &>/dev/null; then
  sudo service tor restart && success "Tor Restarted Using Service"
elif command -v systemctl &>/dev/null; then
  sudo systemctl restart tor && success "Tor Restarted Using Systemctl"
else
  error "Neither 'Service' Nor 'Systemctl' Found. Please Restart Tor Manually."
  exit 1;
fi
info "Checking Your Normal Ip..."
IP=$(curl -s https://api.ipify.org || echo "Unavailable")
info "Checking Your Tor Ip..."
TOR_IP=$(curl -s --socks5-hostname 127.0.0.1:9050 https://api.ipify.org || echo "Unavailable Via Tor")
echo
info "System Ip Address: ${YELLOW}$IP${NC}"
info "Tor Ip Address: ${YELLOW}$TOR_IP${NC}"
if [ "$IP" != "$TOR_IP" ] && [ "$TOR_IP" != "Unavailable Via Tor" ]; then
  success "Tor Is Successfully Routing Traffic Through Socks5!"
  success "You Can Now Start Using 'UseTor' Option In Yt-Dlx!"
else
  warn "Tor May Not Be Working Correctly Or Could Not Be Tested. Please Double-Check Torrc Configuration Or Test Manually."
  warn "System Ip: $IP, Tor Ip: $TOR_IP"
fi
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 
info "Deleting Kali Keyring File ($KEYRING_PATH)..."
if [ -f "$KEYRING_PATH" ]; then
    sudo rm "$KEYRING_PATH"
    if [ $? -eq 0 ]; then
        success "Kali Keyring File Deleted."
    else
        warn "Failed To Delete Kali Keyring File. Manual Removal May Be Needed."
    fi
else
    info "Kali Keyring File Not Found At $KEYRING_PATH. No Deletion Needed."
fi
success "Script Execution Finished."
# = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 