#!/usr/bin/env bash
# Install Node.js, npm, and PostgreSQL on macOS via Homebrew.
# Run: bash scripts/install-mac.sh
# Install Homebrew first if needed: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

set -e

if ! command -v brew &>/dev/null; then
  echo "Homebrew not found. Install from https://brew.sh"
  exit 1
fi

echo "Installing Node.js (includes npm)..."
brew install node

echo "Installing PostgreSQL..."
brew install postgresql@16
brew services start postgresql@16 2>/dev/null || true

# Add PostgreSQL bin to PATH in shell profile so psql is available
PG_BIN="$(brew --prefix postgresql@16 2>/dev/null)/bin"
if [ -d "$PG_BIN" ]; then
  for profile in ~/.zshrc ~/.bash_profile ~/.bashrc; do
    if [ -f "$profile" ]; then
      if ! grep -q "postgresql@16/bin" "$profile" 2>/dev/null; then
        echo "export PATH=\"$PG_BIN:\$PATH\"" >> "$profile"
        echo "Added PostgreSQL to PATH in $profile"
      fi
      break
    fi
  done
  [ -z "$ZSH_VERSION" ] && export PATH="$PG_BIN:$PATH" || export PATH="$PG_BIN:$PATH"
fi

echo "Done. Run 'source ~/.zshrc' or open a new terminal, then verify: node --version, npm --version, psql --version"
