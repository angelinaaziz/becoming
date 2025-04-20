# Becoming - Personal Growth NFT dApp

A decentralized application for tracking personal growth and achievements with soul-bound NFTs that evolve as you achieve milestones.

## Overview

Becoming is a web3 application built on Substrate/Polkadot that allows users to:
- Mint a personal, non-transferable (soul-bound) NFT
- Add verified milestones to their journey
- Watch their avatar evolve as they achieve more milestones
- Share their journey with others

## Setting Up a Real Blockchain Connection

The application is designed to work with an actual blockchain node and smart contract. Here's how to set it up properly:

### Prerequisites

1. Install and run a Substrate contracts node:
   ```
   # Download the substrate-contracts-node
   curl -O -L https://github.com/paritytech/substrate-contracts-node/releases/download/v0.42.0/substrate-contracts-node-mac.tar.gz
   tar -xzf substrate-contracts-node-mac.tar.gz
   
   # Start the node
   ./substrate-contracts-node --dev
   ```

2. Install the correct cargo-contract version:
   ```
   cargo install cargo-contract --version 3.2.0
   ```

3. Deploy the contract:
   ```
   cd contracts
   cargo +nightly contract build
   cargo contract upload --url ws://127.0.0.1:9944 --suri //Alice
   cargo contract instantiate --url ws://127.0.0.1:9944 --suri //Alice --constructor new --skip-confirm
   ```
   
   Make note of the contract address that is displayed after instantiation.

### Configuration

1. Update the `.env` file in the frontend directory with the correct blockchain node and contract address:
   ```
   VITE_WS_PROVIDER=ws://127.0.0.1:9944
   VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
   ```

2. Install Polkadot browser extension and create a test account:
   - Install the [Polkadot.js extension](https://polkadot.js.org/extension/)
   - Add a development account

### Starting the Frontend

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## Development Guide

The application uses:
- Vite + React for the frontend
- TailwindCSS for styling
- Polkadot.js for blockchain interaction
- Ink! for smart contract development

### No Mock Mode

The application is designed to work with a real blockchain connection. The mock mode has been disabled to ensure a proper working environment that accurately reflects real-world usage.

To effectively test and develop with the app:
1. Make sure your substrate node is running
2. Verify the contract is properly instantiated
3. Confirm your `.env` file has the correct endpoint and contract address
4. Install required Polkadot dependencies:
   ```
   npm install @polkadot/api @polkadot/api-contract @polkadot/extension-dapp
   ```

## Troubleshooting

If you encounter blockchain connection issues:

1. Check that your substrate node is running
2. Verify that the contract address in `.env` is correct
3. Make sure you have the Polkadot.js extension installed and at least one account
4. Check browser console for specific error messages

For contract-related errors:
1. Make sure you're using cargo-contract version 3.2.0
2. Rebuild and redeploy the contract if needed
3. Check that the metadata version is compatible with your API version

## License

MIT
