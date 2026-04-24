# Backend Configuration

This guide covers how the bot connects to AI backends (Ollama and LM Studio), how auto-detection works, and how to configure models.

---

## Supported Backends

| Backend | Default URL | API Compatibility |
|---|---|---|
| [Ollama](https://ollama.com) | `http://localhost:11434` | OpenAI-compatible (`/v1/`) |
| [LM Studio](https://lmstudio.ai) | `http://localhost:1234/v1` | OpenAI-compatible |

The bot uses the [OpenAI Node.js SDK](https://github.com/openai/openai-node) to communicate with both backends, since they both expose OpenAI-compatible APIs.

---

## Auto-Detection

The bot includes an **auto-detection loop** that runs every 10 seconds in the background. It:

1. Pings `<ollama-url>/v1/models` with a 2-second timeout
2. If Ollama responds → switches the OpenAI client's `baseURL` to Ollama
3. If Ollama is offline → pings `<lm-studio-url>/models`
4. If LM Studio responds → switches to LM Studio
5. If both are offline → logs a warning

**This means you can freely start/stop Ollama or LM Studio while the bot is running.** The bot will automatically switch to whichever backend is available within 10 seconds.

### Console Output

```
[Bot] [INFO] Auto-switched backend to: Ollama (http://localhost:11434/v1)
```

or

```
[Bot] [INFO] Auto-switched backend to: LM Studio (http://localhost:1234/v1)
```

---

## Environment Variables

### Choosing a Backend

You can configure one or both backends in `.env`:

```env
# Option 1: Ollama only
OLLAMA=http://localhost:11434
MODEL=gemma4:26b

# Option 2: LM Studio only
LM_STUDIO_URL=http://localhost:1234/v1
OPENAI_API_KEY=lm-studio
MODEL=qwen2.5-coder-32b

# Option 3: Both (auto-detect picks whichever is online)
OLLAMA=http://localhost:11434
LM_STUDIO_URL=http://localhost:1234/v1
MODEL=gemma4:26b
```

> **Tip:** To "disable" one backend, just comment it out with `#`.

### Model Name

The `MODEL` variable must match the model name in your backend:

- **Ollama:** Use the exact model tag (e.g., `gemma4:26b`, `llama3.1:8b`). Check with `ollama list`.
- **LM Studio:** Use the model identifier shown in the LM Studio UI, or use `lm-studio` as a fallback.

---

## Tool Calling Compatibility

Not all models support function/tool calling equally. The bot relies on tool calling for:

- `execute_powershell` — Running PowerShell commands
- `read_file` / `write_file` — File operations
- `ask_user_clarification` — Interactive Discord buttons

### Recommended Models for Tool Calling

| Model | Tool Calling | Notes |
|---|---|---|
| `gemma4:26b` | ✅ Good | Recommended for Ollama |
| `qwen2.5-coder` | ✅ Excellent | Best tool-calling performance |
| `llama3.1` | ✅ Good | Solid all-around |
| `mistral` | ⚠️ Partial | May not reliably call tools |
| `phi3` | ❌ Poor | Avoid for agentic workflows |

> **If buttons aren't working:** The model may not be calling the `ask_user_clarification` tool. Try switching to a model with stronger tool-calling support (e.g., `qwen2.5-coder`).

---

## Troubleshooting

### `ECONNREFUSED` Error
```
APIConnectionError: Connection error.
cause: FetchError: request to http://localhost:1234/v1/chat/completions failed
```
**Fix:** Ensure your AI backend is running. Check with `ollama ps` or verify LM Studio's server tab shows "Running".

### Model Not Found
```
Error 404: model "xyz" not found
```
**Fix:** Verify `MODEL` in `.env` matches an installed model. Run `ollama list` to check.

### Slow Responses
Large context windows (agent + multiple skills + conversation history) can slow down inference significantly. To speed things up:
- Use a smaller/quantized model
- Keep skill files concise
- Use `.reset` to clear long conversation histories
