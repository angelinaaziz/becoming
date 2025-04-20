#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building Becoming Smart Contract${NC}"

# Detect OS
OS="$(uname)"
echo -e "Detected OS: ${YELLOW}$OS${NC}"

# Create .cargo/config.toml with proper linker configuration
# This fixes the "linker `rust-lld` not found" error on macOS
if [ "$OS" = "Darwin" ]; then
    echo "Setting up macOS-specific linker configuration..."
    
    # Find the wasm-ld executable
    WASM_LD=$(which wasm-ld || find /opt/homebrew -name "wasm-ld" 2>/dev/null | head -1)
    
    if [ -z "$WASM_LD" ]; then
        echo -e "${RED}Error: wasm-ld not found. Please install lld via brew:${NC}"
        echo "brew install llvm"
        exit 1
    fi
    
    echo -e "Using WASM linker: ${YELLOW}$WASM_LD${NC}"
    
    mkdir -p .cargo
    cat > .cargo/config.toml << EOL
[target.wasm32-unknown-unknown]
# Point to the installed wasm-ld
linker = "$WASM_LD"
rustflags = [
  "-C", "link-arg=--import-memory",
  "-C", "opt-level=3",
  "-C", "debuginfo=0"
]

[profile.release]
panic = "abort"
lto = true
codegen-units = 1
EOL
    
    echo "Created .cargo/config.toml with proper linker configuration"
    
    # Create a symlink to support cargo-contract
    # cargo-contract expects a binary called "rust-lld"
    mkdir -p /tmp/rust-lld-bin
    ln -sf "$WASM_LD" /tmp/rust-lld-bin/rust-lld
    echo "Created symlink from wasm-ld to rust-lld"
    
    # Add the linker to the PATH for this session
    export PATH="/tmp/rust-lld-bin:$PATH"
    echo "Added linker to PATH"
fi

# Check for cargo-contract
if ! command -v cargo-contract &> /dev/null; then
    echo -e "${RED}Error: cargo-contract is not installed.${NC}"
    echo "Please install it with: cargo install cargo-contract --version 3.2.0"
    exit 1
fi

# Build the contract
echo -e "${YELLOW}Building ink! contract...${NC}"
if [ "$1" = "--docker" ]; then
    echo "Building using Docker..."
    docker run --rm -v "$(pwd):/contract" -w /contract paritytech/contracts-ci-linux:latest cargo contract build --release
else
    cargo contract build --release
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed.${NC}"
    exit 1
fi

# Create frontend directory if it doesn't exist
mkdir -p ../frontend/public

# Look for the generated artifacts
CONTRACT_FILE=$(find target/ink -name "*.contract" | head -1)
WASM_FILE=$(find target/ink -name "*.wasm" | head -1)
JSON_FILE=$(find target/ink -name "*.json" | head -1)

# Copy files to the frontend
if [ -n "$WASM_FILE" ]; then
    cp "$WASM_FILE" ../frontend/public/becoming.wasm
    echo -e "${GREEN}✅ Copied WASM file to ../frontend/public/becoming.wasm${NC}"
else
    echo -e "${RED}❌ No WASM file found${NC}"
fi

if [ -n "$JSON_FILE" ]; then
    cp "$JSON_FILE" ../frontend/public/becoming.json
    echo -e "${GREEN}✅ Copied metadata file to ../frontend/public/becoming.json${NC}"
else
    echo -e "${RED}❌ No metadata file found${NC}"
fi

if [ -n "$CONTRACT_FILE" ]; then
    cp "$CONTRACT_FILE" ../frontend/public/becoming.contract
    echo -e "${GREEN}✅ Copied contract bundle to ../frontend/public/becoming.contract${NC}"
else
    echo -e "${YELLOW}⚠️ No contract bundle found${NC}"
fi

# Verify the build
if [ -f "../frontend/public/becoming.wasm" ] && [ -f "../frontend/public/becoming.json" ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful! Contract artifacts are available in ../frontend/public/${NC}"
    wasm_size=$(du -h ../frontend/public/becoming.wasm | cut -f1)
    echo -e "WASM file size: ${YELLOW}$wasm_size${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed or artifacts weren't generated correctly.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Usage Instructions:${NC}"
echo "1. To deploy this contract locally:"
echo "   - Start a local node: substrate-contracts-node --dev"
echo "   - Run the deploy script: cd .. && ./deploy-local.js"
echo ""
echo "2. To deploy to Paseo testnet:"
echo "   - Run the deploy script: cd .. && ./deploy.sh"
echo ""
echo "3. For manual deployment:"
echo "   - Use Contracts UI: https://contracts-ui.substrate.io/"
echo "   - Or use polkadot.js: https://polkadot.js.org/apps/"
echo "   - Full instructions: cd .. && node manual-deployment-guide.js"
echo ""
echo -e "${GREEN}Build complete!${NC}" 