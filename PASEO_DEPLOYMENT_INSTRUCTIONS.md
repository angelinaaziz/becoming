# Paseo Deployment Instructions

## Overview

We encountered DNS resolution issues when attempting to deploy to the Paseo Asset Hub. This document provides instructions for manually deploying the contract once these networking issues are resolved.

## Current Status

- The contract code has been successfully built and the artifacts are available in `contracts/target/ink/`
- The frontend has been configured to use mock mode for now (`VITE_MOCK_MODE=true` in frontend/.env)
- Once the contract is deployed, you'll need to update the frontend configuration

## Deployment Steps

Once the network connectivity issues are resolved, follow these steps to deploy to Paseo:

1. **Get Paseo Testnet Tokens**:
   - Visit [https://faucet.polkadot.io/](https://faucet.polkadot.io/)
   - Select "Paseo" as the network and "AssetHub" as the chain
   - Enter your account address
   - Complete the captcha and submit to receive PAS tokens

2. **Deploy the Contract Using Polkadot.js Apps**:
   - Go to [https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpaseo-asset-hub-rpc.polkadot.io](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpaseo-asset-hub-rpc.polkadot.io)
   - Navigate to "Developer" > "Contracts"
   - Click "Upload & Deploy Code"
   - Select the `contracts/target/ink/becoming.contract` file
   - Follow the prompts to deploy the contract using your funded account

3. **Update Frontend Configuration**:
   - Once deployed, you'll receive a contract address
   - Open the `frontend/.env` file and update:
     ```
     VITE_MOCK_MODE=false
     VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
     VITE_WS_PROVIDER=wss://paseo-asset-hub-rpc.polkadot.io
     ```

4. **Run the Frontend**:
   ```bash
   cd frontend
   npm install  # If not already installed
   npm run dev
   ```

## Alternative Deployment Method

If the `deploy-paseo.sh` script still doesn't work, try using the command line directly:

```bash
cd contracts
cargo contract upload --url "wss://paseo-asset-hub-rpc.polkadot.io" --suri "YOUR_ACCOUNT_SEED" ./target/ink/becoming.wasm
```

Then instantiate the contract with:

```bash
cargo contract instantiate --url "wss://paseo-asset-hub-rpc.polkadot.io" --suri "YOUR_ACCOUNT_SEED" --constructor new --args "Becoming NFT" "BNFT"
```

## Alternative RPC Endpoints

If you continue to face connectivity issues, you can try these alternative Paseo endpoints:

```
wss://paseo-asset-hub-rpc.polkadot.io
wss://paseo-asset-hub-rpc.dwellir.com
```

## Troubleshooting

- If you encounter "Failed to resolve IP addresses" errors, it's likely a DNS issue. Try using a different network or consider using a VPN.
- Ensure your account has sufficient PAS tokens for the deployment.
- If deployment fails, check the transaction error messages in Polkadot.js for more details. 