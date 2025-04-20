#!/bin/bash
set -e

echo "Building directly with cargo..."
# Compile the contract to Wasm
cargo build --target wasm32-unknown-unknown --release

# Create output directory
mkdir -p ../frontend/public

# Copy the wasm file
WASM_FILE=$(find target/wasm32-unknown-unknown/release -name "becoming.wasm" | head -1)
if [[ -f "$WASM_FILE" ]]; then
    cp "$WASM_FILE" ../frontend/public/becoming.wasm
    echo "Copied $WASM_FILE to ../frontend/public/becoming.wasm"
else
    echo "Wasm file not found!"
fi

# Generate a minimal metadata file
echo '{
  "source": {
    "hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "language": "ink! 4.3.0",
    "compiler": "rustc 1.82.0",
    "wasm": "0x0"
  },
  "contract": {
    "name": "becoming",
    "version": "0.1.0",
    "authors": [
      "Angelina for easyA and Polkadot Hackathon"
    ]
  },
  "description": "A soul-bound NFT that evolves as users achieve personal milestones",
  "metadataVersion": "1"
}' > becoming.json

# Copy the metadata file
cp becoming.json ../frontend/public/becoming.json
echo "Created and copied metadata file to ../frontend/public/becoming.json"

echo ""
echo "To properly deploy this contract:"
echo "1. Install substrate-contracts-node"
echo "2. Use the Contracts UI: https://contracts-ui.substrate.io/" 
echo "3. Or deploy via polkadot.js: https://polkadot.js.org/apps/" 