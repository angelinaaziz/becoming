# Becoming: Your Journey, Your NFT

A soul-bound NFT that evolves as you achieve personal milestones.

**Polkadot** · **ink!** · **React** · **Tailwind**

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://becoming.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/Repo-GitHub-blue)](https://github.com/angelinaaziz/becoming)

---

## What is Becoming?

Becoming is a decentralized application that transforms personal growth into a visual journey through soul-bound NFTs that evolve with each milestone. Unlike traditional NFTs that are primarily used for trading or collecting, Becoming NFTs are tied to your identity and create a permanent, verifiable record of your achievements. Our platform empowers users to document their personal growth, build a community of support, and celebrate meaningful accomplishments.

## 🌟 The Problem & Solution

### Problem
Personal growth and achievements often go unrecorded, making it hard to visualise progress and document significant milestones in one's journey. Traditional methods lack the permanence and visual evolution that truly showcase personal development.

### Solution
Becoming transforms personal development into a visual journey through a soul-bound NFT that evolves with each milestone. Unlike traditional NFTs, Becoming NFTs:

- Are tied to your identity (non-transferable)
- Evolve visually as you add milestones
- Create a permanent, verifiable record of achievements
- Build a community where achievements are recognised and celebrated

## ✨ Features

| Soul-bound NFT | Visual Evolution | Immutable Records |
|----------------|------------------|-------------------|
| Tipping System | Community Recognition | Milestone Privacy |

- 🔒 **Soul-bound NFT**: Non-transferable, tied to your identity
- 🎨 **Visual Evolution**: Your avatar evolves through four distinct stages
- 📚 **Milestone Management**: Add, categorise, and display your achievements
- 🔍 **Verifiable Proofs**: Link evidence of achievements with blockchain timestamping
- 🎉 **Achievement Sharing**: Share milestones with your community
- 💰 **Tipping System**: Receive tips for inspiring achievements
- 👥 **Public Profiles**: View others' journeys for inspiration

## 🏗️ Technical Architecture

**Becoming** is built on a modern tech stack:

- **Frontend**: React, TailwindCSS, Framer Motion for smooth animations
- **Smart Contract**: Written in ink! (Rust-based smart contract language for Polkadot)
- **Blockchain**: Deployed on Polkadot's Asset Hub (Paseo Testnet)
- **Storage**: Milestone proofs are hashed and referenced on-chain
- **Authentication**: Polkadot.js wallet extension for secure account management
- **Contract Design**: Custom NFT implementation with soul-bound properties and milestone tracking
- **State Management**: Context API and custom hooks for contract interactions

<!-- Add technical architecture diagram here once available -->

## 💫 Why Polkadot

We chose Polkadot for its robust security, scalability, and developer-friendly environment. The ink! smart contract language provides the safety guarantees of Rust while enabling seamless deployment to Polkadot's ecosystem. With lower transaction costs and cross-chain interoperability, Polkadot offers the perfect foundation for our personal growth NFT platform.

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
chmod +x ./deploy.sh
./deploy.sh
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

### Journey Page - Track Your Growth
![Journey Page](https://raw.githubusercontent.com/angelinaaziz/becoming/main/frontend/public/assets/screenshots/journey-page.png)
*Your personal journey dashboard showing your current level, milestone count, and progress tracker.*

### Mint Page - Begin Your Journey
![Mint Page](https://raw.githubusercontent.com/angelinaaziz/becoming/main/frontend/public/assets/screenshots/mint-page.png)
*The starting point where users can mint their soul-bound NFT and begin their personal growth journey.*

### Add Milestone - Document Your Achievements
![Add Milestone](https://raw.githubusercontent.com/angelinaaziz/becoming/main/frontend/public/assets/screenshots/add-milestone.png)
*Add new milestones with title, description, and verification proof to evolve your avatar.*

### Profile Page - Share Your Journey
![Profile Page](https://raw.githubusercontent.com/angelinaaziz/becoming/main/frontend/public/assets/screenshots/profile-page.png)
*Public profile page showcasing your journey and achievements to inspire others.*

### Celebration Page - Achievement Unlocked
![Celebration Page](https://raw.githubusercontent.com/angelinaaziz/becoming/main/frontend/public/assets/screenshots/celebration-page.png)
*A celebration animation when you reach a new evolution level in your journey.*

## 🗺️ Roadmap

**Phase 1 ✅** - Initial deployment with core functionality
- Soul-bound NFTs and visual evolution
- Milestone tracking and verification
- Basic sharing features

**Phase 2 🚧** - Enhanced community features
- Rich milestone templates and categories
- Achievement badges and challenges
- Advanced profile customization

**Phase 3 🔮** - Ecosystem expansion
- Integration with other personal development platforms
- Organisation accounts for recognising member achievements
- Mobile application with push notifications

**Phase 4 🔮** - Growth and partnerships
- Integration with education platforms for verified credentials
- Community development programs
- Advanced analytics and progress tracking

## 👥 Team
Angelina Aziz - Founder & Developer - [Website](https://www.angelina.dev/) | [LinkedIn](https://www.linkedin.com/in/angelinaaziz) | [Twitter](https://twitter.com/angelinaaziz) | [GitHub](https://github.com/angelinaaziz) | [Instagram](https://www.instagram.com/angelinaaziz) | [TikTok](https://www.tiktok.com/@angelinaaziz) | [Blog](https://www.angelina.dev/blog)


## 🙏 Acknowledgements
- Polkadot ecosystem and community
- ink! smart contract language
- ReactJS and its amazing ecosystem
- TailwindCSS for streamlined styling
- Icons8 for the feature icons

Made with ❤️ for the personal growth community 
