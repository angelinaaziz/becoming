#!/bin/bash

# Script to deploy the Becoming contract to Polkadot Asset Hub testnet
# Make sure cargo-contract is installed: cargo install cargo-contract

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Becoming Contract Deployment Script - Polkadot Asset Hub Testnet${NC}"
echo "This script will build and deploy the contract to Asset Hub testnet."
echo

# Define testnet endpoints
ASSET_HUB_TESTNET="wss://westend-asset-hub-rpc.polkadot.io"

# Check if .env file exists and source it
if [ -f ".env" ]; then
    source .env
    echo -e "${GREEN}Loaded environment variables from .env${NC}"
else
    echo -e "${YELLOW}No .env file found. Using default values.${NC}"
    # Default to Asset Hub testnet
    VITE_WS_PROVIDER="$ASSET_HUB_TESTNET"
fi

# Check for required tools
echo "Checking for required tools..."
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Error: cargo is not installed. Please install Rust and Cargo.${NC}"
    exit 1
fi

if ! command -v cargo-contract &> /dev/null; then
    echo -e "${RED}Error: cargo-contract is not installed. Please run 'cargo install cargo-contract'.${NC}"
    exit 1
fi

# Navigate to contract directory
cd contracts || { echo -e "${RED}Error: contracts directory not found.${NC}"; exit 1; }

echo "Building contract for Asset Hub testnet..."
cargo contract build --release

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Contract build failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Contract built successfully.${NC}"

# Ask for confirmation before deploying
echo
echo -e "${YELLOW}Ready to deploy to Polkadot Asset Hub testnet: $ASSET_HUB_TESTNET${NC}"
read -p "Do you want to continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment canceled by user."
    exit 0
fi

# Ensure account is available for deployment
echo
echo "For contract deployment, you'll need a funded account on Asset Hub testnet."
echo "This script will use the development account //Alice for demo purposes."
echo "For production deployments, you should use your own account (with funds)."
echo

# Deploy contract
echo "Deploying contract to Asset Hub testnet..."
echo "Using WebSocket provider: $ASSET_HUB_TESTNET"

# Use appropriate flags for deployment
echo "Running cargo contract upload..."
DEPLOYMENT_RESULT=$(cargo contract upload --url "$ASSET_HUB_TESTNET" --suri "//Alice" ./target/ink/becoming.wasm 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}Error during contract upload:${NC}"
    echo "$DEPLOYMENT_RESULT"
    exit 1
fi

echo "$DEPLOYMENT_RESULT"

# Extract code hash from output
CODE_HASH=$(echo "$DEPLOYMENT_RESULT" | grep -oP 'Code hash: \K[0-9a-fx]+')

if [ -z "$CODE_HASH" ]; then
    echo -e "${RED}Error: Could not extract code hash from deployment output.${NC}"
    exit 1
fi

echo -e "${GREEN}Contract code uploaded with hash: $CODE_HASH${NC}"

# Instantiate the contract
echo "Instantiating contract..."
INSTANTIATE_RESULT=$(cargo contract instantiate --url "$ASSET_HUB_TESTNET" --suri "//Alice" --constructor new --args "Becoming NFT" "BNFT" "$CODE_HASH" 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}Error during contract instantiation:${NC}"
    echo "$INSTANTIATE_RESULT"
    exit 1
fi

echo "$INSTANTIATE_RESULT"

# Extract contract address from output
CONTRACT_ADDRESS=$(echo "$INSTANTIATE_RESULT" | grep -oP 'Contract address: \K[0-9a-zA-Z]+')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}Error: Could not extract contract address from instantiation output.${NC}"
    exit 1
fi

echo -e "${GREEN}Contract successfully instantiated at address: $CONTRACT_ADDRESS${NC}"

# Update .env file with new contract address
if [ -f "../frontend/.env" ]; then
    sed -i '' "s/VITE_CONTRACT_ADDRESS=.*/VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" ../frontend/.env
    sed -i '' "s#VITE_WS_PROVIDER=.*#VITE_WS_PROVIDER=$ASSET_HUB_TESTNET#" ../frontend/.env
    sed -i '' "s/VITE_MOCK_MODE=.*/VITE_MOCK_MODE=false/" ../frontend/.env
    echo -e "${GREEN}Updated contract address and provider in .env file.${NC}"
else
    echo -e "${YELLOW}Creating new .env file with contract address...${NC}"
    echo "VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > ../frontend/.env
    echo "VITE_WS_PROVIDER=$ASSET_HUB_TESTNET" >> ../frontend/.env
    echo "VITE_MOCK_MODE=false" >> ../frontend/.env
    echo "VITE_DEBUG=true" >> ../frontend/.env
fi

echo
echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}Deployment to Asset Hub testnet complete!${NC}"
echo -e "${GREEN}Contract address: $CONTRACT_ADDRESS${NC}"
echo -e "${GREEN}WebSocket provider: $ASSET_HUB_TESTNET${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo
echo "Next steps:"
echo "1. Your frontend .env file has been updated with these values."
echo "2. Run your frontend application with VITE_MOCK_MODE=false to use the real contract."
echo "3. Test the full user journey with a real wallet (make sure you have funds on Asset Hub testnet)."
echo
echo "Note: For a production deployment, you should:"
echo "- Use your own account with sufficient funds"
echo "- Verify the contract code on-chain"
echo "- Consider using a custom frontend deployment environment variable"

cd ..

exit 0 