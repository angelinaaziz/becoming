#!/bin/bash
set -e

echo "Building ink! contract using Docker for reproducible builds..."

# Create docker image for contract building
docker build -t ink-contract-builder -f Dockerfile .

# Create a container from the image and copy the build artifacts
echo "Extracting build artifacts from container..."
docker create --name ink-builder ink-contract-builder
mkdir -p ../frontend/public

# Copy the wasm file
docker cp ink-builder:/contract/target/ink/becoming.wasm ../frontend/public/becoming.wasm 2>/dev/null || echo "⚠️ WASM file not found in container"

# Copy the metadata file
docker cp ink-builder:/contract/target/ink/becoming.json ../frontend/public/becoming.json 2>/dev/null || echo "⚠️ Metadata file not found in container"

# Clean up the container
docker rm ink-builder

# Verify the files were copied
if [ -f "../frontend/public/becoming.wasm" ] && [ -f "../frontend/public/becoming.json" ]; then
    echo "✅ Successfully built and extracted contract artifacts!"
    echo "Files available at:"
    echo "  - ../frontend/public/becoming.wasm"
    echo "  - ../frontend/public/becoming.json"
else
    echo "❌ Failed to extract some contract artifacts."
    echo "This might be due to a build failure within the container."
    echo "Try running 'docker logs $(docker ps -lq)' to see the detailed build logs."
    exit 1
fi

echo ""
echo "To use this contract:"
echo "1. Start a local node: substrate-contracts-node --dev"
echo "2. Use Contracts UI: https://contracts-ui.substrate.io/" 
echo "3. Or use polkadot.js: https://polkadot.js.org/apps/" 