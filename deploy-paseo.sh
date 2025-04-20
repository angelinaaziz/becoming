#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Set the endpoint for Paseo Asset Hub
PASEO_ENDPOINT="wss://asset-hub-paseo-rpc.dwellir.com"

echo -e "${YELLOW}Deploying Becoming contract to Paseo Asset Hub...${NC}"

# Navigate to contracts directory
cd contracts || { echo -e "${RED}Error: contracts directory not found.${NC}"; exit 1; }

# Build the contract
echo "Building contract..."
cargo contract build --release

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Contract build failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Contract built successfully.${NC}"

# Deploy contract to Paseo
echo "Uploading contract code to Paseo Asset Hub..."
DEPLOYMENT_RESULT=$(cargo contract upload --url "$PASEO_ENDPOINT" --suri "//Alice" ./target/ink/becoming.wasm 2>&1)

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
INSTANTIATE_RESULT=$(cargo contract instantiate --url "$PASEO_ENDPOINT" --suri "//Alice" --constructor new --args "Becoming NFT" "BNFT" "$CODE_HASH" 2>&1)

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

# Update frontend .env file
cd ..
if [ -f "frontend/.env" ]; then
    sed -i '' "s/VITE_CONTRACT_ADDRESS=.*/VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" frontend/.env
    sed -i '' "s#VITE_WS_PROVIDER=.*#VITE_WS_PROVIDER=$PASEO_ENDPOINT#" frontend/.env
    sed -i '' "s/VITE_MOCK_MODE=.*/VITE_MOCK_MODE=false/" frontend/.env
    echo -e "${GREEN}Updated contract address and provider in .env file.${NC}"
else
    echo -e "${YELLOW}Creating new .env file with contract address...${NC}"
    echo "VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > frontend/.env
    echo "VITE_WS_PROVIDER=$PASEO_ENDPOINT" >> frontend/.env
    echo "VITE_MOCK_MODE=false" >> frontend/.env
    echo "VITE_DEBUG=true" >> frontend/.env
fi

echo
echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}Deployment to Paseo Asset Hub complete!${NC}"
echo -e "${GREEN}Contract address: $CONTRACT_ADDRESS${NC}"
echo -e "${GREEN}WebSocket provider: $PASEO_ENDPOINT${NC}"
echo -e "${GREEN}=========================================================${NC}"

exit 0 