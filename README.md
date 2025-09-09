# Deep Research Assistant

A distributed, recursive Deep Research Agent powered by Resonate and OpenAI. This example demonstrates how complex, distributed agentic applications can be implemented with simple code.

## Use Case

Given a topic, the Deep Research Agent decomposes the topic into subtopics, and recursively invokes itself (via OpenAI parallel tool calling) on each subtopic.

---

## Installation & Usage

To run this project you need an [OpenAI API Key](https://platform.openai.com)

### 1. Clone the repository

```
git clone https://github.com/resonatehq-examples/openai-deep-research-agent-ts
cd openai-deep-research-agent-ts
```

### 2. Set your OpenAI API Key

```
export OPENAI_API_KEY="sk-..."
```

### 3. Run the Agent

```
npm run dev
```

## Troubleshooting

The Deep Research Agent depends on OpenAI and the OpenAI TypeScript and JavaScript  SDK. If you are having trouble, verify that your OpenAI credentials are configured correctly and the model is accessible by running the following command in the project's directory:

```
node -e "import OpenAI from 'openai'; const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); (async () => { const res = await client.chat.completions.create({ model: 'gpt-5', messages: [{ role: 'user', content: 'knock knock' }] }); console.log(res.choices[0].message); })();"
```

If everything is configured correctly, you will see a response from OpenAI such as:

```
{ role: 'assistant', content: "Who's there?", refusal: null, annotations: []}
```

If you are still having trouble, please open an issue on the [GitHub repository](https://github.com/resonatehq-examples/openai-deep-research-agent-ts/issues).
