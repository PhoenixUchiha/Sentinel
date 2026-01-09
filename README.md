<div align="center">
  <img src="https://img.shields.io/badge/Sentinel-Production--Ready-blue?style=for-the-badge&logo=discord&logoColor=white" alt="Sentinel Banner">
  
  # 🛡️ Sentinel
  **Advanced Discord Moderation & Security Engine**

  [Features](#-features) • [Setup](#-setup) • [Architecture](#-architecture) • [Security](#-security)
</div>

<br />

Sentinel is a high-performance, enterprise-grade Discord bot designed for scale, security, and automated moderation. Built with Node.js and powered by MongoDB, it features native sharding to handle millions of users across thousands of servers.

## ✨ Features

- **🛡️ Advanced Security**: Built-in Anti-Raid, Alt-Checking, and Quarantine systems.
- **⚖️ Powerful Moderation**: Full suite of commands including Warn, Timeout, Kick, Ban, and Nuke.
- **🎙️ Voice Protection**: Automated soundboard spam prevention and voice event logging.
- **💾 Persistent Data**: High-speed MongoDB integration for warnings, cases, and guild settings.
- **📈 Scalable Core**: Native Discord sharding for load balancing and high availability.
- **📝 Comprehensive Logs**: Detailed audit trails for messages, members, and moderation actions.

## 🚀 Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18.x or higher
- [MongoDB](https://www.mongodb.com/) instance
- [Discord Bot Token](https://discord.com/developers/applications)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/PhoenixUchiha/Sentinel.git
   cd Sentinel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   TOKEN=your_discord_bot_token
   MONGO_URI=your_mongodb_connection_string
   CLIENT_ID=your_bot_client_id
   ```

4. **Start the Bot**
   ```bash
   # Start with sharding (Recommended for production)
   node src/sharder.js

   # Start individual instance
   node src/index.js
   ```

## 🏗️ Architecture

Sentinel is built with a modular "Handler" architecture:
- **`src/sharder.js`**: Spawns and manages individual shards.
- **`src/handlers/`**: Decoupled routers for commands, events, and interactions.
- **`src/utils/db.js`**: Centralized MongoDB management and schemas.
- **`src/commands/`**: Organized by category (Moderation, Security, Utility, Setup).

## 🔒 Security

Sentinel prioritizes privacy and security:
- **Environment Isolation**: Sensitive keys are never hardcoded.
- **Input Validation**: Strict validation for all slash command inputs.
- **Rate Limiting**: Intelligent cooldown system to prevent bot abuse.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/PhoenixUchiha">PhoenixUchiha</a>
</p>
