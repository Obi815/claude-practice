import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";

const client = new Anthropic();

// Each tool = name + description + inputSchema + the function to run (all in one place)
const getWeather = betaTool({
    name: "get_weather",
    description: "Get today's current weather for a city.",
    inputSchema: {
        type: "object",
        properties: { city: { type: "string", description: "The city to check" } },
        required: ["city"],
    },
    run: async (input) => `Weather in ${input.city} today: 38F, snow flurries`,
});

const getForecast = betaTool({
    name: "get_forecast",
    description: "Get the weather forecast for the next few days for a city.",
    inputSchema: {
        type: "object",
        properties: { city: { type: "string", description: "The city to check" } },
        required: ["city"],
    },
    run: async (input) => `${input.city} next 3 days: 45F cloudy, 52F partly sunny, 61F sunny`,
});

// The runner does the whole loop for you
const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    tools: [getWeather, getForecast],
    messages: [
        { role: "user", content: "I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?" },
    ],
});

// Print the final answer
for (const block of finalMessage.content) {
    if (block.type === "text") {
        console.log(block.text);
    }
}