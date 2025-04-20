#!/bin/bash
set -e

echo "Generating metadata for the contract..."

# Create a temporary metadata file
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

# Create frontend/public directory if it doesn't exist
mkdir -p ../frontend/public

# Copy the metadata to the frontend
cp becoming.json ../frontend/public/

echo "Metadata file created at frontend/public/becoming.json"
echo ""
echo "Note: This is a placeholder metadata file."
echo "For a complete build with proper WASM binary, you need the LLVM tools properly configured."
echo ""
echo "To do a proper build later:"
echo "1. Ensure rust-lld is properly installed: rustup component add rust-src rust-std"
echo "2. Reinstall cargo-contract making sure it has the right dependencies" 