#!/bin/bash
set -e

echo "Building ink! smart contract with proper linker setup..."

# Create .cargo/config.toml with proper linker configuration
# This fixes the "linker `rust-lld` not found" error on macOS
mkdir -p .cargo
cat > .cargo/config.toml << EOL
[target.wasm32-unknown-unknown]
# Point to the installed wasm-ld
linker = "/opt/homebrew/Cellar/lld/20.1.3/bin/wasm-ld"
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
ln -sf /opt/homebrew/Cellar/lld/20.1.3/bin/wasm-ld /tmp/rust-lld-bin/rust-lld
echo "Created symlink from wasm-ld to rust-lld"

# Add the linker to the PATH for this session
export PATH="/tmp/rust-lld-bin:$PATH"
echo "Added linker to PATH"

# Build the contract
echo "Building ink! contract..."
cargo contract build --release

# Create frontend directory if it doesn't exist
mkdir -p ../frontend/public

# Look for the generated artifacts
CONTRACT_FILE=$(find target/ink -name "*.contract" | head -1)
WASM_FILE=$(find target/ink -name "*.wasm" | head -1)
JSON_FILE=$(find target/ink -name "*.json" | head -1)

# Copy files to the frontend
if [ -n "$WASM_FILE" ]; then
    cp "$WASM_FILE" ../frontend/public/becoming.wasm
    echo "✅ Copied WASM file to ../frontend/public/becoming.wasm"
else
    echo "❌ No WASM file found"
fi

if [ -n "$JSON_FILE" ]; then
    cp "$JSON_FILE" ../frontend/public/becoming.json
    echo "✅ Copied metadata file to ../frontend/public/becoming.json"
else
    echo "❌ No metadata file found"
fi

if [ -n "$CONTRACT_FILE" ]; then
    cp "$CONTRACT_FILE" ../frontend/public/becoming.contract
    echo "✅ Copied contract bundle to ../frontend/public/becoming.contract"
else
    echo "⚠️ No contract bundle found"
fi

# Verify the build
if [ -f "../frontend/public/becoming.wasm" ] && [ -f "../frontend/public/becoming.json" ]; then
    echo ""
    echo "✅ Build successful! Contract artifacts are available in ../frontend/public/"
    wasm_size=$(du -h ../frontend/public/becoming.wasm | cut -f1)
    echo "WASM file size: $wasm_size"
else
    echo ""
    echo "❌ Build failed or artifacts weren't generated correctly."
    exit 1
fi

echo ""
echo "To deploy this contract:"
echo "1. Start a local node: substrate-contracts-node --dev"
echo "2. Use Contracts UI: https://contracts-ui.substrate.io/"
echo "3. Or use polkadot.js: https://polkadot.js.org/apps/" 