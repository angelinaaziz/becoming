// Guide for deploying Becoming NFT contract to Paseo Asset Hub
const fs = require('fs');
const path = require('path');

// Configuration
const PASEO_ENDPOINT = 'wss://asset-hub-paseo-rpc.dwellir.com';
// Alternative endpoints:
// const PASEO_ENDPOINT = 'wss://paseo-asset-hub-rpc.polkadot.io';
// const PASEO_ENDPOINT = 'wss://paseo-asset-hub-rpc.dwellir.com';

// Path to contract files
const CONTRACT_PATH = path.join(__dirname, 'contracts/target/ink/becoming.contract');
const WASM_PATH = path.join(__dirname, 'contracts/target/ink/becoming.wasm');

function printDeploymentInstructions() {
  console.log('\n========== MANUAL DEPLOYMENT INSTRUCTIONS ==========');
  console.log('1. Obtain Paseo Testnet Tokens:');
  console.log('   - Visit https://faucet.polkadot.io/');
  console.log('   - Select "Paseo" as the network and "AssetHub" as the chain');
  console.log('   - Enter your wallet address and receive tokens');
  console.log('\n2. Deploy the contract using Polkadot.js Apps:');
  console.log('   - Go to https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fasset-hub-paseo-rpc.dwellir.com#/contracts');
  console.log('   - Click on "Upload & deploy code"');
  console.log(`   - Upload the contract file located at: ${CONTRACT_PATH}`);
  console.log('   - Set the contract name: "Becoming NFT"');
  console.log('   - Deploy with appropriate gas settings (leave defaults if unsure)');
  console.log('   - Sign and submit the transaction with your account');
  console.log('\n3. After deployment, copy the contract address');
  console.log('\n4. Update the frontend/.env file with:');
  
  // Create or update .env template
  const envPath = path.join(__dirname, 'frontend/.env');
  const envContent = `VITE_CONTRACT_ADDRESS=your_contract_address_here
VITE_WS_PROVIDER=${PASEO_ENDPOINT}
VITE_MOCK_MODE=false
VITE_DEBUG=true`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`   - Template .env file created at: ${envPath}`);
    console.log('   - Replace "your_contract_address_here" with your actual contract address');
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