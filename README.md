# Becoming: Your Journey, Your NFT

<p align="center">
  <img src="frontend/public/stage3_pixel_avatar.png" alt="Becoming NFT" width="200"/>
</p>

<p align="center">
  <b>A soul-bound NFT that evolves as you achieve personal milestones.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Polkadot-E6007A?style=for-the-badge&logo=polkadot&logoColor=white" alt="Polkadot" />
  <img src="https://img.shields.io/badge/ink!-121212?style=for-the-badge&logo=parity-substrate&logoColor=white" alt="ink!" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

## 🚀 Demo

<p align="center">
  <a href="https://github.com/angelinaaziz/becoming" target="_blank">GitHub Repository</a>
</p>

## 🌟 The Problem & Solution

### Problem

Personal growth and achievements often go unrecorded, making it hard to visualise progress and document significant milestones in one's journey. Traditional methods lack the permanence and visual evolution that truly showcase personal development.

### Solution

**Becoming** transforms personal development into a visual journey through a soul-bound NFT that evolves with each milestone. Unlike traditional NFTs, Becoming NFTs:

- Are tied to your identity (non-transferable)
- Evolve visually as you add milestones
- Create a permanent, verifiable record of achievements
- Build a community where achievements are recognised and celebrated

## ✨ Features

<p align="center">
  <table>
    <tr>
      <td align="center"><img src="https://img.icons8.com/fluency/48/null/nft.png"/><br /><b>Soul-bound NFT</b></td>
      <td align="center"><img src="https://img.icons8.com/fluency/48/null/pixel-art.png"/><br /><b>Visual Evolution</b></td>
      <td align="center"><img src="https://img.icons8.com/fluency/48/null/check-lock.png"/><br /><b>Immutable Records</b></td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.icons8.com/fluency/48/null/bitcoin.png"/><br /><b>Tipping System</b></td>
      <td align="center"><img src="https://img.icons8.com/fluency/48/null/conference.png"/><br /><b>Community Recognition</b></td>
      <td align="center"><img src="https://img.icons8.com/fluency/48/null/private.png"/><br /><b>Milestone Privacy</b></td>
    </tr>
  </table>
</p>

- **🔒 Soul-bound NFT**: Non-transferable, tied to your identity
- **🎨 Visual Evolution**: Your avatar evolves through four distinct stages
- **📚 Milestone Management**: Add, categorise, and display your achievements
- **🔍 Verifiable Proofs**: Link evidence of achievements with blockchain timestamping
- **🎉 Achievement Sharing**: Share milestones with your community
- **💰 Tipping System**: Receive tips for inspiring achievements
- **👥 Public Profiles**: View others' journeys for inspiration

## 🏗️ Architecture

**Becoming** is built on a modern tech stack:

- **Frontend**: React, TailwindCSS, Framer Motion for smooth animations
- **Smart Contract**: Written in ink! (Rust-based smart contract language for Polkadot)
- **Blockchain**: Deployed on Polkadot's Asset Hub (Paseo Testnet)
- **Storage**: Milestone proofs are hashed and referenced on-chain
- **Authentication**: Polkadot.js wallet extension for secure account management

## 🔧 Installation

### Prerequisites

- Node.js v16 or higher
- Rust and Cargo
- Polkadot.js browser extension

### Contract Deployment

```bash
# Clone the repository
git clone https://github.com/angelinaaziz/becoming.git
cd becoming

# Build and deploy the contract to Paseo testnet
chmod +x ./deploy-paseo.sh
./deploy-paseo.sh
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Hosting the Frontend

After building the frontend, you can serve it using any static hosting solution:

```bash
# Install a local server if needed
npm install -g serve

# Serve the built frontend
serve -s frontend/dist
```

You can also deploy to:
- GitHub Pages
- AWS S3 + CloudFront
- Netlify
- Any static file hosting service

## 📱 Screenshots

<p align="center">
  <i>Screenshots coming soon...</i>
</p>

## 🗺️ Roadmap

- **Phase 1** ✅ - Initial deployment with core functionality
  - Soul-bound NFTs and visual evolution
  - Milestone tracking and verification
  - Basic sharing features

- **Phase 2** 🚧 - Enhanced community features
  - Rich milestone templates and categories
  - Achievement badges and challenges
  - Advanced profile customisation

- **Phase 3** 🔮 - Ecosystem expansion
  - Integration with other personal development platforms
  - Organisation accounts for recognising member achievements
  - Mobile application with push notifications

- **Phase 4** 🔮 - Growth and partnerships
  - Integration with education platforms for verified credentials
  - Community development programmes
  - Advanced analytics and progress tracking

## 👥 Team

- **Angelina Aziz** - Founder & Developer - [GitHub](https://github.com/angelinaaziz) | [Twitter](https://twitter.com/angelinaaziz)

## 📄 Licence

This project is licensed under the MIT Licence - see the [LICENCE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Polkadot](https://polkadot.network/) ecosystem and community
- [ink!](https://use.ink/) smart contract language
- [ReactJS](https://reactjs.org/) and its amazing ecosystem
- [TailwindCSS](https://tailwindcss.com/) for streamlined styling
- [Icons8](https://icons8.com/) for the feature icons

---

<p align="center">
  Made with ❤️ for the personal growth community
</p> 