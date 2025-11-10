// Resonate
import type { Context } from "@resonatehq/sdk";
// Open AI
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
	throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

export const aiclient = new OpenAI({ apiKey });

export const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
	{
		type: "function",
		function: {
			name: "research",
			description: "Research a given topic",
			parameters: {
				type: "object",
				properties: {
					topic: {
						type: "string",
						description: "The topic to research",
					},
				},
				required: ["topic"],
			},
		},
	},
];

export async function prompt(
	_ctx: Context,
	messages: any[],
	hasToolAccess: boolean,
): Promise<any> {
	const completion = await aiclient.chat.completions.create({
		model: "gpt-5",
		messages: messages,
		tools: TOOLS,
		tool_choice: hasToolAccess ? "auto" : "none",
	});
	return completion.choices[0]?.message;
}

export const SYSTEM_PROMPT = `
  You are a recursive research agent.

  When given a broad or high-level topic, break it down into 2–3 semantically meaningful subtopics and call the "research" tool for each one individually.

  Do not call the research tool if the topic is already well understood or deeply specific. Instead, summarize the topic directly instead of calling the tool.

  Always respond with either:
  1. A summary paragraph of the topic, or
  2. One or more tool calls, each with a single subtopic to be researched.

  Be concise and respond in plain English. Avoid repeating the topic verbatim in the subtopics.
`;

export function* research(
	ctx: Context,
	topic: string,
	depth: number,
): Generator<any, string, any> {
	const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
		{ role: "system", content: SYSTEM_PROMPT },
		{ role: "user", content: `Research ${topic}` },
	];

	while (true) {
		// Prompt the LLM
		// Only allow tool access if depth > 0
		const message = yield* ctx.run(prompt, messages, depth > 0);

		messages.push(message);

		// Handle parallel tool calls by recursively starting the deep research agent
		// and subsequently awaiting the results
		if (message.tool_calls) {
			const handles = [];
			for (const tool_call of message.tool_calls) {
				const tool_name = tool_call.function.name;
				const tool_args = JSON.parse(tool_call.function.arguments);
				if (tool_name === "research") {
					const handle = yield* ctx.beginRpc(
						research,
						tool_args.topic,
						depth - 1,
					);
					handles.push([tool_call, handle]);
				}
			}
			for (const [tool_call, handle] of handles) {
				const result = yield* handle;
				messages.push({
					role: "tool",
					tool_call_id: tool_call.id,
					content: result,
				});
			}
		} else {
			return message.content || "";
		}
	}
}
