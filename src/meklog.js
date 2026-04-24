export const LogLevel = { Info: "INFO", Warning: "WARN", Error: "ERROR", Debug: "DEBUG" };

export class Logger {
    constructor(production, name) {
        this.name = name || "Logger";
        this.data = this.name;
        
        const logFn = (level, ...args) => {
            console.log(`[${this.name}] [${level}]`, ...args);
        };
        logFn.data = this.name;
        return logFn;
    }
}
