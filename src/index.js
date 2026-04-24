import { ShardingManager, Events } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const production = process.env.NODE_ENV == "prod" || process.env.NODE_ENV == "production";

const log = (...args) => console.log(`[Shard Manager]`, ...args);

log("INFO", "Loading");

const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "bot.js");
const manager = new ShardingManager(filePath, { token: process.env.TOKEN });

manager.on("shardCreate", async shard => {
	const shardLog = (...args) => console.log(`[Shard #${shard.id}]`, ...args);

	shardLog("INFO", "Created shard");

	shard.once(Events.ClientReady, async () => {
		shard.send({ shardID: shard.id });

		shardLog("INFO", "Shard ready");
	});
});

manager.spawn();

