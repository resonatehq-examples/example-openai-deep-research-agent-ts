// Resonate HQ
import { Resonate } from "@resonatehq/sdk";
import { research } from "./agent";

const resonate = Resonate.local();

const researchFunction = resonate.register("research", research);

async function main() {
	// Extract CLI arguments (after the first two which are node and filename)
	const [id, topic, depthArg] = process.argv.slice(2);
	const depth = depthArg ? parseInt(depthArg, 10) : 1;

	if (!id || !topic) {
		console.error("Usage: bun index.ts <id> <topic> [depth]");
		process.exit(1);
	}

	return await researchFunction.run(id, topic, depth);
}

main()
	.then(console.log)
	.catch(console.error)
	.finally(() => resonate.stop());
