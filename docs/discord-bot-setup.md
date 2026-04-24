# Discord Bot Setup Guide

Step-by-step instructions for creating a Discord application, configuring your bot, setting permissions, and getting the bot token needed for AI-Discord-Bridge.

---

## Overview

Before running AI-Discord-Bridge, you need to create a **Discord Application** in the Developer Portal. This gives you a **bot token** (used to authenticate your bot) and lets you configure what the bot is allowed to do in your server.

---

## Step 1 — Create a Discord Application

1. Go to the **Discord Developer Portal**:
   ```
   https://discord.com/developers/applications
   ```
2. Sign in with your Discord account (the account that will own the bot).
3. Click the **"New Application"** button in the top-right corner.
4. Enter a name for your application (e.g., `AI-Bridge` or `Kitty`). This is the display name.
5. Accept the Developer Terms of Service.
6. Click **"Create"**.

You'll be taken to the **General Information** page for your new application.

---

## Step 2 — Create the Bot User

1. In the left sidebar, click **"Bot"**.
2. You should see a bot user was automatically created with your application. If not, click **"Add Bot"** and confirm.
3. **Set a bot username** (optional) — This is the name that appears in Discord. Click the pencil icon next to the bot name to change it.
4. **Set an avatar** (optional) — Upload a profile picture for your bot.

---

## Step 3 — Get Your Bot Token

The bot token is the password your application uses to log into Discord. **Treat it like a password — never share it or commit it to source control.**

1. On the **Bot** page, find the **Token** section.
2. Click **"Reset Token"** (you may need to confirm with 2FA if enabled).
3. Click **"Copy"** to copy the token to your clipboard.
4. Paste it into your `.env` file:
   ```env
   TOKEN=paste-your-token-here
   ```

> [!CAUTION]
> **If your token is ever leaked** (e.g., pushed to GitHub), go back to the Bot page and click "Reset Token" immediately. The old token will be invalidated.

---

## Step 4 — Enable Privileged Intents

AI-Discord-Bridge requires **privileged Gateway intents** to read message content and see server members. Without these, the bot cannot see what users type.

1. On the **Bot** page, scroll down to **Privileged Gateway Intents**.
2. Enable the following intents:

| Intent | Required | Why |
|---|---|---|
| **Message Content Intent** | ✅ Yes | Allows the bot to read the content of messages (required to respond to mentions and commands) |
| **Server Members Intent** | ✅ Yes | Allows the bot to see the member list (used for user identification) |
| **Presence Intent** | ❌ Optional | Not required for AI-Discord-Bridge |

3. Click **"Save Changes"** at the bottom.

> **Note:** If your bot is in fewer than 100 servers, these intents are automatically approved. If your bot reaches 100+ servers, you'll need to apply for verification through Discord.

---

## Step 5 — Configure Installation Settings

1. In the left sidebar, click **"Installation"** (or **"OAuth2"** in older portal layouts).
2. Under **Installation Contexts**, make sure **Guild Install** is checked. This allows the bot to be installed into servers.
3. Under **Install Link**, select **"Discord Provided Link"** (this is the simplest option).

---

## Step 6 — Set OAuth2 Scopes and Bot Permissions

This step defines what your bot is allowed to do when added to a server.

### Option A: Using the Installation Page (Recommended)

1. On the **Installation** page, under **Guild Install**:
2. Add the following **scopes**:
   - `bot` — Required to add a bot user to the server
   - `applications.commands` — Required for slash commands (e.g., `/agent`)

3. Under **Bot Permissions**, select the permissions your bot needs:

| Permission | Required | Why |
|---|---|---|
| **Send Messages** | ✅ | Bot needs to respond in channels |
| **Send Messages in Threads** | ✅ | Bot can respond in thread conversations |
| **Read Message History** | ✅ | Bot needs to read conversation context |
| **Embed Links** | ✅ | Bot sends formatted embed messages |
| **Attach Files** | ✅ | Bot can send file attachments |
| **Use Slash Commands** | ✅ | Enables the `/agent` command |
| **Add Reactions** | ⬜ Optional | Not strictly required |
| **Manage Messages** | ⬜ Optional | Allows the bot to delete its own messages |

> **Shortcut:** You can select **Administrator** to grant all permissions. This is simpler but gives the bot full control — only recommended for private/personal servers.

### Option B: Using the URL Generator

1. In the left sidebar, click **"OAuth2"** → **"URL Generator"**.
2. Under **Scopes**, check:
   - `bot`
   - `applications.commands`
3. Under **Bot Permissions**, select the permissions listed above (or **Administrator**).
4. Copy the generated URL at the bottom.

---

## Step 7 — Invite the Bot to Your Server

1. Copy the **install link** from either:
   - The **Installation** page (the "Discord Provided Link")
   - The **OAuth2 URL Generator** (the generated URL at the bottom)
2. Paste the URL into your browser.
3. Select the server you want to add the bot to from the dropdown.
   > You must have **Manage Server** permission on the target server.
4. Review the requested permissions and click **"Authorize"**.
5. Complete the CAPTCHA if prompted.

Your bot should now appear in the server's member list (it will show as offline until you start the application).

---

## Step 8 — Get Your Channel ID(s)

AI-Discord-Bridge only responds in specific channels that you configure. You need the **channel ID** (not the channel name).

1. In Discord, go to **User Settings** → **Advanced** → Enable **Developer Mode**.
2. Right-click the channel where you want the bot to respond.
3. Click **"Copy Channel ID"**.
4. Paste it into your `.env` file:
   ```env
   # Single channel
   CHANNELS=123456789012345678

   # Multiple channels (comma-separated, no spaces)
   CHANNELS=123456789012345678,987654321098765432
   ```

---

## Step 9 — Complete Your `.env` File

With everything configured, your `.env` file should have at minimum:

```env
# Discord bot token (from Step 3)
TOKEN=your-bot-token-here

# AI model name (must match what's installed in Ollama)
MODEL=gemma3:12b

# Ollama server URL
OLLAMA=http://localhost:11434

# Channel IDs the bot responds in
CHANNELS=123456789012345678
```

---

## Summary Checklist

Use this checklist to verify everything is configured:

- [ ] Created a Discord Application in the Developer Portal
- [ ] Bot user exists on the Bot page
- [ ] Bot token copied and saved to `.env` as `TOKEN`
- [ ] **Message Content Intent** enabled
- [ ] **Server Members Intent** enabled
- [ ] OAuth2 scopes set: `bot` + `applications.commands`
- [ ] Bot permissions configured (Send Messages, Read History, Embed Links, etc.)
- [ ] Bot invited to your server via the install link
- [ ] Developer Mode enabled in Discord settings
- [ ] Channel ID(s) copied and saved to `.env` as `CHANNELS`

---

## Troubleshooting

### Bot is online but doesn't respond to messages
**Cause:** Message Content Intent is not enabled.
**Fix:** Go to Bot page → enable **Message Content Intent** → Save Changes → restart the bot.

### Bot doesn't appear in the server
**Cause:** The invite URL didn't include the `bot` scope, or you selected the wrong server.
**Fix:** Re-generate the invite URL with the `bot` scope and re-invite.

### "Missing Permissions" error
**Cause:** The bot doesn't have the required permissions in the channel.
**Fix:** Check the channel's permission overrides. Make sure the bot role has Send Messages and Read Message History permissions in that specific channel.

### Slash commands (`/agent`) don't appear
**Cause:** The `applications.commands` scope was not included when inviting, or commands haven't been registered yet.
**Fix:**
1. Re-invite the bot with both `bot` and `applications.commands` scopes.
2. Slash commands are auto-registered when the bot starts. Restart the bot and wait ~1 minute for Discord to propagate.

### "Invalid Token" error on startup
**Cause:** The token in `.env` is wrong, expired, or has extra whitespace.
**Fix:** Go to the Bot page, click "Reset Token", copy the new token, and paste it into `.env` with no extra spaces or quotes.

---

## Next Steps

- [Ollama Setup](ollama-setup.md) — Install Ollama and download an AI model
- [Backend Configuration](backend-config.md) — Fine-tune Ollama, LM Studio, and model settings
- [Discord Features](discord-features.md) — Learn about buttons, slash commands, and interactive UI
