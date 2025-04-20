// Script to deploy the contract to a locally-running substrate node
// This will:
// 1. Check if the local node is running
// 2. Deploy the contract
// 3. Update the frontend .env file

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_NODE_URL = 'ws://127.0.0.1:9944';
const CONTRACT_PATH = path.join(__dirname, 'contracts/target/ink/becoming.contract');
const FRONTEND_ENV_PATH = path.join(__dirname, 'frontend/.env');

// Helper function to run a command and return a promise
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    exec(command, { maxBuffer: 1024 * 1000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

// Function to check if local node is running
async function checkNodeRunning() {
  try {
    // Simple curl to check if the node is responding
    const output = await runCommand(`curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"system_health","params":[],"id":1}' http://127.0.0.1:9944`);
    console.log('✅ Local node is running');
    return true;
  } catch (error) {
    console.log('❌ Local node is not running');
    
    // Check if substrate-contracts-node is installed
    try {
      await runCommand('which substrate-contracts-node');
      console.log('Starting a local substrate node...');
      
      // Start the node in background
      const nodeProcess = spawn('substrate-contracts-node', ['--dev'], {
        detached: true,
        stdio: 'ignore'
      });
      
      // Unref the child so parent can exit independently
      nodeProcess.unref();
      
      console.log('Node started with PID:', nodeProcess.pid);
      console.log('Waiting for node to initialize...');
      
      // Wait a bit for the node to start
      await new Promise(resolve => setTimeout(resolve, 8000));
      return true;
    } catch (error) {
      console.log('❌ substrate-contracts-node is not installed');
      console.log(`
Please install substrate-contracts-node first:

Option 1: Using cargo
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git

Option 2: Using the pre-built binaries from:
https://github.com/paritytech/substrate-contracts-node/releases

Then try running this script again.
`);
      return false;
    }
  }
}

// Function to deploy the contract
async function deployContract() {
  try {
    console.log('Deploying contract to local node...');
    
    // Upload contract code
    console.log('Uploading contract code...');
    const uploadOutput = await runCommand(`cargo contract upload --url ${LOCAL_NODE_URL} --suri //Alice --output-json ${CONTRACT_PATH}`);
    
    // Parse the output as JSON to extract the code hash
    const uploadResult = JSON.parse(uploadOutput);
    const codeHash = uploadResult.codeHash;
    
    if (!codeHash) {
      throw new Error('Failed to extract code hash from output');
    }
    
    console.log(`Contract code uploaded with hash: ${codeHash}`);
    
    // Instantiate the contract
    console.log('Instantiating contract...');
    const instantiateOutput = await runCommand(`cargo contract instantiate --constructor new --url ${LOCAL_NODE_URL} --suri //Alice --code-hash ${codeHash} --output-json --skip-confirm`);
    
    // Parse the output as JSON
    const instantiateResult = JSON.parse(instantiateOutput);
    const contractAddress = instantiateResult.contract;
    
    if (!contractAddress) {
      throw new Error('Failed to extract contract address from output');
    }
    
    console.log(`Contract instantiated at address: ${contractAddress}`);
    
    return contractAddress;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

// Function to update the frontend .env file
function updateEnvFile(contractAddress) {
  try {
    const envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}
VITE_WS_PROVIDER=${LOCAL_NODE_URL}
VITE_MOCK_MODE=false
VITE_DEBUG=true`;
    
    fs.writeFileSync(FRONTEND_ENV_PATH, envContent);
    console.log(`✅ Updated .env file with contract address: ${contractAddress}`);
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting deployment process...');
    
    // Check if node is running
    const nodeRunning = await checkNodeRunning();
    if (!nodeRunning) {
      console.error('❌ Failed to connect to local node. Make sure it is running.');
      process.exit(1);
    }
    
    // Deploy contract
    const contractAddress = await deployContract();
    
    // Update .env file
    updateEnvFile(contractAddress);
    
    console.log('✅ Deployment complete!');
    console.log(`
=================================================
Contract successfully deployed! 🎉
Contract address: ${contractAddress}
Local node URL: ${LOCAL_NODE_URL}
=================================================

Next steps:
1. Start your frontend: 
   cd frontend && npm run dev

2. Access your application in the browser
`);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 