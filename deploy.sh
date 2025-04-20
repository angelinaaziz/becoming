#!/usr/bin/env bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Becoming Contract Deployment Script - Paseo Asset Hub${NC}"
echo "This script will build and deploy the contract to Paseo Asset Hub."
echo

# Check if endpoint is provided
if [ -n "$PASEO_ENDPOINT" ]; then
  echo -e "${YELLOW}Using provided endpoint: $PASEO_ENDPOINT${NC}"
else
  # Default Paseo endpoints
  PASEO_ENDPOINT="wss://paseo-asset-hub-rpc.polkadot.io"
  echo -e "${YELLOW}Using default endpoint: $PASEO_ENDPOINT${NC}"
  echo -e "${YELLOW}Alternative endpoints: wss://asset-hub-paseo-rpc.dwellir.com, wss://paseo-asset-hub-rpc.dwellir.com${NC}"
fi

# Check if seed phrase is provided
if [ -z "$SEED_PHRASE" ]; then
  echo -e "${YELLOW}No seed phrase provided. Using default account //Alice.${NC}"
  SEED_PHRASE="//Alice"
fi

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

# Upload contract to Paseo Asset Hub
echo "Uploading contract code to Paseo Asset Hub..."
echo "Using endpoint: $PASEO_ENDPOINT"

UPLOAD_RESULT=$(cargo contract upload --url "$PASEO_ENDPOINT" --suri "$SEED_PHRASE" --skip-confirm ./target/ink/becoming.wasm 2>&1)

if echo "$UPLOAD_RESULT" | grep -q "Error"; then
  echo -e "${RED}Error during contract upload:${NC}"
  echo "$UPLOAD_RESULT"
  echo -e "${YELLOW}You might want to try an alternative endpoint or check your connection.${NC}"
  exit 1
fi

echo "$UPLOAD_RESULT"

# Extract code hash from output
CODE_HASH=$(echo "$UPLOAD_RESULT" | grep -oP 'Code hash: \K[0-9a-fx]+')

if [ -z "$CODE_HASH" ]; then
  echo -e "${RED}Error: Could not extract code hash from upload output.${NC}"
  exit 1
fi

echo -e "${GREEN}Contract code uploaded with hash: $CODE_HASH${NC}"

# Instantiate the contract
echo "Instantiating contract..."
INSTANTIATE_RESULT=$(cargo contract instantiate --url "$PASEO_ENDPOINT" --suri "$SEED_PHRASE" \
  --constructor new --args "Becoming NFT" "BNFT" \
  --skip-confirm 2>&1)

if echo "$INSTANTIATE_RESULT" | grep -q "Error"; then
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
cd ../frontend || { echo -e "${RED}Error: frontend directory not found.${NC}"; exit 1; }
echo "Updating frontend .env file..."

if [ -f ".env" ]; then
    # Update existing .env file
    sed -i.bak "s/VITE_CONTRACT_ADDRESS=.*/VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
    sed -i.bak "s#VITE_WS_PROVIDER=.*#VITE_WS_PROVIDER=$PASEO_ENDPOINT#" .env
    sed -i.bak "s/VITE_MOCK_MODE=.*/VITE_MOCK_MODE=false/" .env
    rm -f .env.bak
    echo -e "${GREEN}Existing .env file updated successfully.${NC}"
else
    # Create new .env file
    cat > .env << EOL
# Becoming NFT App Configuration

# Contract address
VITE_CONTRACT_ADDRESS=$CONTRACT_ADDRESS

# Blockchain connection
VITE_WS_PROVIDER=$PASEO_ENDPOINT

# Set to false to use real contract
VITE_MOCK_MODE=false

# Enable debug mode for more verbose logging
VITE_DEBUG=true

# Contract chain name
VITE_CONTRACTS_CHAIN_NAME=Paseo Asset Hub
EOL
    echo -e "${GREEN}New .env file created successfully.${NC}"
fi

cd ..

echo
echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}Deployment to Paseo Asset Hub complete!${NC}"
echo -e "${GREEN}Contract address: $CONTRACT_ADDRESS${NC}"
echo -e "${GREEN}WebSocket provider: $PASEO_ENDPOINT${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo
echo "Next steps:"
echo "1. Your frontend .env file has been updated with these values."
echo "2. Run your frontend application: cd frontend && npm run dev"
echo "3. Make sure you have the Polkadot.js extension installed in your browser."
echo "4. To get test PAS for fees, join Matrix at #paseo_faucet:matrix.org and"
echo "   post your SS58 address (starts with 5...)."
echo

exit 0 