import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// The menu of tools Claude is allowed to ask for
const tools = [
    {
        name: "get_weather",
        description: "Get today’s current weather for a city",
        input_schema: {
            type: "object",
            properties: {
                city: { type: "string", description: "City name only, no state. Example: Monterey" },
            },
            required: ["city"],
        },
    },
    {
        name: "get_forecast",
        description: "Get the weather forecast for the next few days for a city.",
        input_schema: {
            type: "object",
            properties: {
                city: {type: "string", description: "The city to check"}
            },
            required: ["city"]
        }
    }
];
// The actual "lookups" (fake data for now)
const fakeWeather = {
    "Monterey": "62F, foggy",
    "Santa Cruz": "66F, partly cloudy",
    "Napa": "75F, sunny",
    "Sacramento": "98F, heat wave",
    "Lake Tahoe": "35F, snowstorm",
};

function getWeather(city) {
    const name = city.split(",")[0].trim();   // "Monterey, CA" → "Monterey"
    return `Weather in ${name} today: ${fakeWeather[name] ?? "70F, clear"}`;
}

function getForecast(city) {
    return `${city} next 3 days: 45F cloudy, 52F partly sunny, 61F sunny`;
}

// Your code actually runs the tool (fake data for now)
function runTool(name, input) {
    switch (name) {
        case "get_weather":
            return getWeather(input.city);
        case "get_forecast":
            return getForecast(input.city)
        default:
            throw new Error(`Unknown tool: ${name}`)
    }
}

const messages = [
    { role: "user", content: "Plan a road trip out of San Francisco with two stops, weighing weather and drive time." },
];

// The agent loop
while (true) {
    const response = await client.messages.create({
        model: "claude-haiku-5-5",
        max_tokens: 16000,
        thinking: { type: "adaptive", display: "summarized" },
        output_config: { effort: "low" },
        tools,
        messages,
    });

    console.log(`\n--- stop_reason: ${response.stop_reason} ---`);

    // Print Claude's thinking (runs every turn)
    for (const block of response.content) {
        if (block.type === "thinking") {
            console.log(`💭 ${block.thinking}`);
        }
    }
    console.log(`(thinking tokens: ${response.usage.output_tokens_details?.thinking_tokens ?? 0})`);

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