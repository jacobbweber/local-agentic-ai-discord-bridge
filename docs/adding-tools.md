# Adding a New Tool

Tools are functions that the AI can call during a conversation. When the AI decides it needs to perform an action (run a command, ask the user a question, read a file), it calls a tool. This guide shows you how to add new tools.

---

## How Tools Work

The bot uses the [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling) format. Each tool has:

1. **A definition** in `src/powershell/tools.js` — tells the AI what the tool does and what parameters it accepts
2. **Execution logic** in `src/bot.js` inside the `processAgentRequest()` function — the actual code that runs when the AI calls the tool

---

## Step 1: Define the Tool

Open `src/powershell/tools.js` and add a new object to the `tools` array:

```javascript
{
    type: "function",
    function: {
        name: "my_new_tool",
        description: "A clear description of what this tool does. The AI reads this to decide when to use it.",
        parameters: {
            type: "object",
            properties: {
                param_one: {
                    type: "string",
                    description: "What this parameter is for."
                },
                param_two: {
                    type: "number",
                    description: "An optional numeric parameter."
                }
            },
            required: ["param_one"]
        }
    }
}
```

### Tips for Good Tool Definitions

- **Be specific** in the `description` — the AI uses it to decide when to call the tool
- **Keep parameters minimal** — fewer parameters = fewer chances for the model to hallucinate values
- **Use `required`** — mark parameters the tool absolutely needs to function

---

## Step 2: Implement the Execution Logic

Open `src/bot.js` and find the `processAgentRequest()` function. Inside the tool execution loop, add an `else if` branch:

```javascript
} else if (toolCall.function.name === "my_new_tool") {
    const paramOne = args.param_one;
    const paramTwo = args.param_two || 42; // default value

    // Your tool logic here
    try {
        const result = await doSomething(paramOne, paramTwo);
        toolResult = `Success: ${result}`;
    } catch (err) {
        toolResult = `ERROR: ${err.message}`;
    }
}
```

> **Important:** The tool must always set `toolResult` to a string. This string is sent back to the AI as the tool's response.

---

## Step 3: Test

1. Restart the bot
2. Send a message that should trigger the tool
3. Watch the console for:
   ```
   [Bot] [DEBUG] [Tool] Executing: my_new_tool
   [Bot] [DEBUG] [Tool] "my_new_tool" result (42 chars): Success: ...
   ```

---

## Existing Tools Reference

| Tool | Description |
|---|---|
| `execute_powershell` | Runs a PowerShell command in `PROJECT_DIR`. Blocked commands trigger Safe Mode buttons. |
| `read_file` | Reads a file from the project directory. |
| `write_file` | Writes content to a file in the project directory. |
| `ask_user_clarification` | Sends Discord buttons to the user for interactive Q&A. The AI pauses until the user clicks. |

---

## Checklist

- [ ] Added tool definition to `src/powershell/tools.js`
- [ ] Added `else if` execution branch in `processAgentRequest()` in `src/bot.js`
- [ ] Tool always sets `toolResult` to a string
- [ ] Tested with `node -c src/bot.js` (syntax check)
- [ ] Restarted bot and verified tool appears in logs
