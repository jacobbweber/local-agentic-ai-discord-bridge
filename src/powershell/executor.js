import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_DIR = process.env.PROJECT_DIR || process.cwd();
const REPO_DIR = process.env.REPO_DIR || process.cwd();

// A simple check for potentially destructive or network-calling cmdlets
const UNSAFE_REGEX = /(Remove-Item|Stop-Process|Restart-Computer|Invoke-WebRequest|Invoke-RestMethod|Set-ExecutionPolicy|Clear-Content|Format-Volume)/i;

export class SafetyError extends Error {
    constructor(command, reason) {
        super(`Safety check failed: ${reason}`);
        this.name = "SafetyError";
        this.command = command;
    }
}

/**
 * Resolves a filename to an absolute path within the given base directory.
 * Throws if the resolved path escapes the base directory (path traversal protection).
 */
function resolveSecurePath(filename, baseDir) {
    const resolvedPath = path.resolve(baseDir, filename);
    if (!resolvedPath.startsWith(path.resolve(baseDir))) {
        throw new Error(`Access denied: Cannot access files outside of ${baseDir}`);
    }
    return resolvedPath;
}

/**
 * Returns the working directory for the current context.
 * - "repo" mode → REPO_DIR (the bot's own source code)
 * - default    → PROJECT_DIR (the user's general workspace)
 */
function getWorkingDir(useRepoDir = false) {
    return useRepoDir ? REPO_DIR : PROJECT_DIR;
}

export async function executePowerShell(command, bypassSafety = false, useRepoDir = false) {
    if (!bypassSafety && UNSAFE_REGEX.test(command)) {
        throw new SafetyError(command, "Potentially destructive command detected");
    }

    const cwd = getWorkingDir(useRepoDir);

    return new Promise((resolve, reject) => {
        const ps = spawn("pwsh", ["-NoProfile", "-NonInteractive", "-Command", command], {
            cwd,
        });

        let stdout = "";
        let stderr = "";

        ps.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        ps.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        ps.on("close", (code) => {
            if (code !== 0 && stderr) {
                resolve(`Error (Exit Code ${code}):\n${stderr}`);
            } else {
                resolve(stdout.trim() || "Command executed successfully with no output.");
            }
        });

        ps.on("error", (err) => {
            reject(err);
        });
    });
}

export async function readFile(filename, useRepoDir = false) {
    const baseDir = getWorkingDir(useRepoDir);
    const filePath = resolveSecurePath(filename, baseDir);
    try {
        const content = await fs.readFile(filePath, "utf-8");
        return content;
    } catch (err) {
        return `Failed to read file: ${err.message}`;
    }
}

export async function writeFile(filename, content, useRepoDir = false) {
    const baseDir = getWorkingDir(useRepoDir);
    const filePath = resolveSecurePath(filename, baseDir);
    try {
        // Ensure parent directories exist
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, "utf-8");
        return `File ${filename} successfully written.`;
    } catch (err) {
        return `Failed to write file: ${err.message}`;
    }
}
