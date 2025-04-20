// Manual Deployment Guide for Becoming NFT contract
const fs = require('fs');
const path = require('path');

// Configuration
const PASEO_ENDPOINT = 'wss://paseo-asset-hub-rpc.polkadot.io';
// Alternative endpoints:
// const PASEO_ENDPOINT = 'wss://asset-hub-paseo-rpc.dwellir.com';
// const PASEO_ENDPOINT = 'wss://paseo-asset-hub-rpc.dwellir.com';

// Path to contract files
const CONTRACT_PATH = path.join(__dirname, 'contracts/target/ink/becoming.contract');
const WASM_PATH = path.join(__dirname, 'contracts/target/ink/becoming.wasm');

function printDeploymentInstructions() {
  console.log('\n========== MANUAL DEPLOYMENT INSTRUCTIONS ==========');
  console.log('\nThis guide provides instructions for manually deploying the Becoming NFT contract');
  console.log('when automated scripts are not working due to connectivity issues.\n');
  
  console.log('1. Obtain Paseo Testnet Tokens:');
  console.log('   - Visit https://faucet.polkadot.io/');
  console.log('   - Select "Paseo" as the network and "AssetHub" as the chain');
  console.log('   - Enter your wallet address and receive tokens');
  
  console.log('\n2. Deploy the contract using Polkadot.js Apps:');
  console.log('   - Go to https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpaseo-asset-hub-rpc.polkadot.io#/contracts');
  console.log('   - Click on "Upload & deploy code"');
  console.log(`   - Upload the contract file located at: ${CONTRACT_PATH}`);
  console.log('   - Set the contract name: "Becoming NFT"');
  console.log('   - Deploy with appropriate gas settings (leave defaults if unsure)');
  console.log('   - Sign and submit the transaction with your account');
  
  console.log('\n3. After deployment, copy the contract address');
  
  console.log('\n4. Update the frontend/.env file with:');
  
  // Create or update .env template
  const envPath = path.join(__dirname, 'frontend/.env');
  const envContent = `# Becoming NFT App Configuration

# Contract address (replace with your deployed contract address)
VITE_CONTRACT_ADDRESS=your_contract_address_here

# Blockchain connection (you can use any of the alternative endpoints below if needed)
VITE_WS_PROVIDER=${PASEO_ENDPOINT}

# Set to false to use real contract
VITE_MOCK_MODE=false

# Enable debug mode for more verbose logging
VITE_DEBUG=true

# Contract chain name
VITE_CONTRACTS_CHAIN_NAME=Paseo Asset Hub`;
  
  try {
    fs.writeFileSync(envPath + '.example', envContent);
    console.log(`   - Template .env file created at: ${envPath}.example`);
    console.log('   - Copy this file to .env and replace "your_contract_address_here" with your actual contract address');
  } catch (error) {
    console.error('Error creating .env template:', error);
  }
  
  console.log('\n5. Start the frontend:');
  console.log('   - cd frontend');
  console.log('   - npm install (if not done already)');
  console.log('   - npm run dev');
  
  console.log('\n6. Alternative RPC endpoints if you encounter connection issues:');
  console.log('   - wss://paseo-asset-hub-rpc.polkadot.io');
  console.log('   - wss://paseo-asset-hub-rpc.dwellir.com');
  console.log('   - wss://asset-hub-paseo-rpc.dwellir.com');
  
  console.log('\n7. Automated Deployment Alternative:');
  console.log('   If manual deployment is too cumbersome, try:');
  console.log('   - chmod +x ./deploy.sh');
  console.log('   - ./deploy.sh');
  
  console.log('\n=================================================');
}

// Check if contract files exist
if (!fs.existsSync(CONTRACT_PATH) || !fs.existsSync(WASM_PATH)) {
  console.error('Error: Contract files not found. Please build the contract first.');
  console.log('\nTo build the contract:');
  console.log('1. cd contracts');
  console.log('2. cargo contract build --release');
  process.exit(1);
}

// Print deployment instructions
printDeploymentInstructions(); 