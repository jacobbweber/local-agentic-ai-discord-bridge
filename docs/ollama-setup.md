# Ollama Installation Guide

Step-by-step instructions for downloading, installing, and configuring Ollama for use with AI-Discord-Bridge.

---

## What Is Ollama?

[Ollama](https://ollama.com) is a local AI model runner that lets you download and run large language models (LLMs) entirely on your own machine. AI-Discord-Bridge uses Ollama as its primary AI backend — no cloud API keys or subscriptions required.

---

## System Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| **OS** | Windows 10 (64-bit) | Windows 11 |
| **RAM** | 8 GB | 16+ GB |
| **Disk Space** | ~4 GB (app + one small model) | 20+ GB (for larger models) |
| **GPU** | Not required (CPU-only works) | NVIDIA GPU with 8+ GB VRAM |

> **Note:** Models run on CPU if no compatible GPU is detected. A GPU dramatically improves response speed.

---

## Step 1 — Download Ollama

1. Open your browser and go to the **Ollama download page**:
   ```
   https://ollama.com/download/windows
   ```
2. Click the **"Download for Windows"** button.
3. Save the installer (`OllamaSetup.exe`) to your Downloads folder.

---

## Step 2 — Install Ollama

1. **Run the installer** — Double-click `OllamaSetup.exe`.
2. **Follow the prompts** — Accept the license agreement and click through the installation wizard. The defaults are fine for most users.
3. **Wait for completion** — The installer will:
   - Install the Ollama application
   - Add `ollama` to your system PATH
   - Start the Ollama background service automatically
4. **Verify the install** — Open a new PowerShell or Command Prompt window and run:
   ```powershell
   ollama --version
   ```
   You should see output like:
   ```
   ollama version 0.6.x
   ```

> **Tip:** If `ollama` is not recognized, close and reopen your terminal so the updated PATH takes effect.

---

## Step 3 — Pull (Download) a Model

Ollama doesn't ship with any models — you need to pull one. Open a terminal and run:

```powershell
ollama pull gemma3:12b
```

This downloads the model to your local machine. The download size depends on the model:

| Model | Size | Good For |
|---|---|---|
| `gemma3:12b` | ~8 GB | Great balance of speed and quality |
| `gemma4:26b` | ~16 GB | Higher quality, needs more VRAM |
| `qwen2.5-coder` | ~4.5 GB | Excellent for code and tool calling |
| `llama3.1:8b` | ~4.7 GB | Solid all-around, smaller footprint |
| `mistral` | ~4.1 GB | Fast, good for casual chat |

> **Recommendation for AI-Discord-Bridge:** Use `gemma3:12b` or `qwen2.5-coder` for the best tool-calling support (required for PowerShell execution, file operations, and interactive buttons).

### Browse All Available Models

Visit the Ollama model library to see everything available:
```
https://ollama.com/search
```

---

## Step 4 — Verify Ollama Is Running

Ollama runs as a background service after installation. Verify it's active:

```powershell
ollama ps
```

If no models are loaded yet, you'll see an empty table — that's fine. It means the service is running.

You can also test the API endpoint directly:

```powershell
curl http://localhost:11434/v1/models
```

You should get a JSON response listing your installed models.

---

## Step 5 — Test a Model

Run a quick interactive test to make sure everything works:

```powershell
ollama run gemma3:12b
```

This opens an interactive chat session in your terminal. Type a message, get a response, then type `/bye` to exit.

---

## Step 6 — Configure AI-Discord-Bridge

Once Ollama is installed and a model is pulled, update your `.env` file in the project root:

```env
# Ollama URL (default port is 11434)
OLLAMA=http://localhost:11434

# Must match the exact model tag you pulled
# Check your installed models with: ollama list
MODEL=gemma3:12b
```

> **Important:** The `MODEL` value must exactly match the model tag from `ollama list`. For example, if you pulled `gemma3:12b`, use `gemma3:12b` — not `gemma3` or `gemma-3-12b`.

---

## Common Ollama Commands

| Command | Description |
|---|---|
| `ollama list` | List all installed models |
| `ollama pull <model>` | Download a model |
| `ollama rm <model>` | Delete a model |
| `ollama run <model>` | Start an interactive chat session |
| `ollama ps` | Show currently loaded/running models |
| `ollama serve` | Manually start the Ollama server (if not running as a service) |
| `ollama --version` | Show installed version |

---

## Troubleshooting

### Ollama command not found
**Cause:** Terminal was open before installation.
**Fix:** Close and reopen your terminal, or restart your computer.

### Model download stalls or fails
**Cause:** Network interruption or insufficient disk space.
**Fix:** Re-run the `ollama pull <model>` command — it resumes from where it left off. Check available disk space with:
```powershell
Get-PSDrive C | Select-Object Used, Free
```

### `ECONNREFUSED` when starting the bot
**Cause:** Ollama service isn't running.
**Fix:** Start it manually:
```powershell
ollama serve
```
Then verify with `curl http://localhost:11434/v1/models`.

### Slow responses
**Cause:** Model is too large for available RAM/VRAM, forcing CPU fallback.
**Fix:** Switch to a smaller model (e.g., `qwen2.5-coder` or `llama3.1:8b`), or use a quantized variant.

### GPU not being used
**Cause:** Ollama doesn't detect your GPU, or drivers are outdated.
**Fix:** Update your NVIDIA drivers to the latest version from [nvidia.com/drivers](https://www.nvidia.com/drivers). Ollama automatically uses CUDA-compatible GPUs when available.

---

## Updating Ollama

To update Ollama to the latest version, simply download and run the installer again from:
```
https://ollama.com/download/windows
```
Your models and configuration are preserved across updates.

---

## Next Steps

- [Discord Bot Setup](discord-bot-setup.md) — Create your Discord application and get your bot token
- [Backend Configuration](backend-config.md) — Configure Ollama, LM Studio, and model settings
