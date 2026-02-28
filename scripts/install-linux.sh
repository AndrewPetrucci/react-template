#!/usr/bin/env bash
# Install Node.js (LTS), npm, and PostgreSQL on Linux (Debian/Ubuntu).
# Run: sudo bash scripts/install-linux.sh
# npm is included with Node.js.

set -e

echo "Installing Node.js LTS and npm (via NodeSource)..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing PostgreSQL and client..."
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Ensure psql is on PATH (apt usually puts it in /usr/bin)
if [ -x /usr/bin/psql ]; then
  case ":$PATH:" in
    *:/usr/bin:*) ;;
    *) export PATH="/usr/bin:$PATH"
       echo "Added /usr/bin to PATH for this session."
       echo "To make permanent, add to ~/.bashrc: export PATH=\"/usr/bin:\$PATH\"" ;;
  esac
fi

echo "Done. Verify: node --version, npm --version, psql --version"
echo "Start PostgreSQL: sudo systemctl start postgresql"
