# Frontend Deployment Guide

This guide provides instructions for deploying the Becoming NFT frontend to various hosting platforms.

## Prerequisites

Before deploying, make sure you have:

1. Built the frontend application:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Properly configured your `.env` file with the correct blockchain endpoints and contract address:
   ```
   VITE_MOCK_MODE=false
   VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
   VITE_WS_PROVIDER=wss://paseo-asset-hub-rpc.polkadot.io
   ```

## Option 1: Local Deployment

For testing or personal use, you can deploy locally:

```bash
# Install serve globally if you haven't already
npm install -g serve

# Serve the built application
cd frontend
serve -s dist
```

Your application will be accessible at `http://localhost:3000`.

## Option 2: GitHub Pages

To deploy to GitHub Pages:

1. **Update base path in `vite.config.ts`**:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/becoming/', // Update this to match your repository name
     // ... other configuration
   });
   ```

2. **Create a GitHub Pages workflow**:
   Create a file at `.github/workflows/deploy.yml` with the following content:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: 16

         - name: Install dependencies
           run: |
             cd frontend
             npm ci

         - name: Build
           run: |
             cd frontend
             npm run build

         - name: Deploy
           uses: JamesIves/github-pages-deploy-action@v4
           with:
             folder: frontend/dist
             branch: gh-pages
   ```

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push
   ```

4. **Enable GitHub Pages** in your repository settings, selecting the `gh-pages` branch as the source.

## Option 3: Netlify

To deploy to Netlify:

1. **Create a `netlify.toml` file** in the root of your repository:
   ```toml
   [build]
     base = "frontend"
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy using Netlify CLI**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy
   cd frontend
   netlify deploy
   ```
   
   For production deployment:
   ```bash
   netlify deploy --prod
   ```

3. **Alternatively**, connect your GitHub repository to Netlify through their web interface.

## Option 4: AWS S3 + CloudFront

For a production-ready setup with AWS:

1. **Create an S3 bucket** for website hosting

2. **Upload your build files**:
   ```bash
   aws s3 sync frontend/dist s3://your-bucket-name --delete
   ```

3. **Create a CloudFront distribution** pointing to your S3 bucket

4. **Set up routing rules** to handle React Router paths.

## Environment Variables

Regardless of the deployment platform, make sure your environment variables are properly set. For platforms that support environment variables (like Netlify), you can set them directly in their dashboard.

For static hosting like GitHub Pages or S3, you should include the environment variables in your build:

1. Create a `.env.production` file in the `frontend` directory
2. Build with this file: `npm run build`

## SSL/HTTPS

Most platforms handle SSL for you automatically. If you're using a custom solution, ensure you configure SSL certificates properly for secure blockchain connections to work.

## Troubleshooting

- If you encounter issues with WebSocket connections, ensure your hosting provider supports WebSockets
- For routing issues, ensure proper redirects are in place for React Router to handle client-side navigation
- Check your browser console for any CORS-related errors when connecting to blockchain nodes 