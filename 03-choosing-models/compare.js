import Anthropic from "@anthropic-ai/sdk"; // Imports SDK

const client = new Anthropic(); // Creates a new Client (finds API key)

const prompt = "Explain what an API is in two sentences."; // The question we'll send to each model
const models = ['claude-haiku-5-5', "claude-sonnet-5-5", 'claude-opus-5-5']; // Array of models to test

for (const model of models){ // loops through each model in models array 
    const start = Date.now(); // starts stopwatch

    const response = await client.messages.create({ // Sends the prompt to this model and waits for the answer before moving on
        model, 
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt}]
    });

    const seconds = (Date.now() - start) / 1000; //stops stopwatch and converts it to seconds
    console.log(`\n=== ${model} (${seconds}s) ===`) // Logs which model ran and how long it took
    console.log(response.usage); // Logs how many tokens were used (this is what you pay for) 

    for (const block of response.content) { // Loops through each block in Claude's response
        if (block.type === 'text') { // Only print text blocks (skip tool calls, thinking, etc.) 
            console.log(block.text) // Prints Claude's answer
        }
    }
}