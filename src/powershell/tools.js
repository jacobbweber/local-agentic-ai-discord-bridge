export const tools = [
    {
        type: "function",
        function: {
            name: "execute_powershell",
            description: "Executes a PowerShell command in the local project directory. Use this to analyze system state, run tests, or execute scripts.",
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        description: "The PowerShell command to execute."
                    }
                },
                required: ["command"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Reads the content of a file in the project directory.",
            parameters: {
                type: "object",
                properties: {
                    filename: {
                        type: "string",
                        description: "The relative path to the file to read (e.g., 'src/index.js' or 'script.ps1')."
                    }
                },
                required: ["filename"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "write_file",
            description: "Writes content to a file in the project directory. Will overwrite existing content.",
            parameters: {
                type: "object",
                properties: {
                    filename: {
                        type: "string",
                        description: "The relative path to the file to write."
                    },
                    content: {
                        type: "string",
                        description: "The full content to write to the file."
                    }
                },
                required: ["filename", "content"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "ask_user_clarification",
            description: "Ask the user a clarifying question with clickable options to resolve ambiguity or architectural decisions before proceeding.",
            parameters: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description: "The question to ask the user."
                    },
                    options: {
                        type: "array",
                        items: { type: "string" },
                        description: "A list of 2 to 5 options for the user to choose from."
                    }
                },
                required: ["question", "options"]
            }
        }
    }
];
