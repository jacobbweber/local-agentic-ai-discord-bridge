<div align="center">
    <h1>Discord AI Local-Agent Bridge</h1>
    <h3 align="center">Connect Discord to your local LM Studio instance with full Agentic PowerShell execution capabilities!</h3>
</div>

This project transforms a standard Discord bot into a powerful local agent. Powered by **LM Studio** and **PowerShell 7**, you can upload scripts, ask the bot to analyze or run code, and seamlessly interact with your local machine securely via Discord.

## 🚀 Key Features

- **LM Studio Integration:** Uses the OpenAI Node.js SDK to connect to your local LM Studio Server (e.g., Qwen2.5 Coder, Llama 3).
- **PowerShell Agent:** The bot has "Tool Calling" capabilities. It can spawn a `pwsh` child process, read/write files in a restricted project directory, and execute commands.
- **Safe Mode:** Potentially destructive commands (like `Remove-Item` or `Stop-Process`) are intercepted. The bot will send an interactive message with **Approve** / **Deny** buttons in Discord before executing.
- **Multi-File Analysis:** Upload `.ps1` or text files directly to the Discord chat. The bot will read them, analyze the code, and suggest updates.

---

## 🛠️ Quickstart Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18+ recommended)
- [PowerShell 7 (`pwsh`)](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows) installed and added to PATH.
- [LM Studio](https://lmstudio.ai/) installed.

### 2. Configure LM Studio
1. Open **LM Studio**.
2. Download a coding-capable model (e.g., `Qwen2.5 Coder`).
3. Navigate to the **Local Server** tab.
4. Start the server (ensure it runs on `http://localhost:1234/v1`).

### 3. Setup Discord Bot
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a New Application -> Go to the **Bot** tab.
3. **Important:** Enable **Message Content Intent** and **Server Members Intent**.
4. Invite the bot to your server via **OAuth2 -> URL Generator** (Select `bot` scope and Admin permissions).

### 4. Project Configuration
1. Clone this repository and navigate to the directory:
   ```bash
   git clone https://github.com/238SAMIxD/discord-ai-bot.git
   cd discord-ai-bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file:
   - `TOKEN`: Your Discord Bot Token.
   - `CHANNELS`: The Channel ID(s) where you want the bot to listen (comma-separated).
   - `PROJECT_DIR`: The absolute path to the local directory you want the bot to interact with (e.g., `C:\Users\YourName\Documents\AgentWorkspace`). **The bot cannot access files outside this directory.**
   - *Optional:* Adjust `LM_STUDIO_URL` if you run it on a different port.

### 5. Start the Agent
Run the following command to start the bridge:
```bash
npm start
```

---

## 🤖 How to Use

- **Chatting:** Just mention the bot (`@BotName hello!`) or reply to its messages.
- **Running Code:** Ask the bot to execute a command:
  > *"Hey @BotName, run a powershell command to list all items in the current directory."*
- **Analyzing Scripts:** Drag and drop a `.ps1` file into the Discord chat.
  > *"Analyze this script and fix the logic error on line 42."*
- **Safe Mode Approvals:** If the bot tries to delete a file or run an intrusive command, it will pause and show an **Approve / Deny** button inside Discord. Click Approve to authorize the action!

---
*Based on the original [discord-ai-bot](https://github.com/238SAMIxD/discord-ai-bot).*
