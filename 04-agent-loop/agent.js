import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// The menu of tools Claude is allowed to ask for
const tools = [
    {
        name: "get_weather",
        description: "Get the current weather for a city.",
        input_schema: {
            type: "object",
            properties: {
                city: { type: "string", description: "The city to get weather for" },
            },
            required: ["city"],
        },
    },
];

// Your code actually runs the tool (fake data for now)
function runTool(name, input) {
    if (name === "get_weather") {
        return `Weather in ${input.city}: 95F, sunny`;
    }
    throw new Error(`Unknown tool: ${name}`);
}

const messages = [
    { role: "user", content: "Should I pack the same clothes for Austin and Seattle?" },
];

// The agent loop
while (true) {
    const response = await client.messages.create({
        model: "claude-haiku-5-5",
        max_tokens: 1024,
        tools,
        messages,
    });

    console.log(`\n--- stop_reason: ${response.stop_reason} ---`);

    if (response.stop_reason === "end_turn") {
        // Claude is done: print the answer and stop
        for (const block of response.content) {
            if (block.type === "text") {
                console.log(block.text);
            }
        }
        break;
    } else if (response.stop_reason === "tool_use") {
        // Claude wants a tool: run it and collect the result
        const toolResults = [];
        for (const block of response.content) {
            if (block.type === "tool_use") {
                console.log(`Claude asked for: ${block.name}(${JSON.stringify(block.input)})`);
                const result = runTool(block.name, block.input);
                toolResults.push({
                    type: "tool_result",
                    tool_use_id: block.id,
                    content: result,
                });
            }
        }
        // Add Claude's request and our results to the conversation, then loop again
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });
    } else {
        // Safety net: anything unexpected stops the loop
        console.log("Unexpected stop reason, stopping.");
        break;
    }
}