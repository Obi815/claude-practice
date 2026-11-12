import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ===== CALL 1: WEB SEARCH (Anthropic runs the search) =====
const searchResponse = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
    messages: [
        { role: "user", content: "What is Anthropic's latest model release? Answer in one sentence." },
    ],
});

console.log("=== WEB SEARCH ===");
let searchAnswer = "";
for (const block of searchResponse.content) {
    if (block.type === "server_tool_use") {
        console.log(`🔎 Claude searched: ${JSON.stringify(block.input)}`);
    } else if (block.type === "text") {
        searchAnswer += block.text;   // collect the pieces
    }
}
console.log(searchAnswer);
console.log(`(searches used: ${searchResponse.usage.server_tool_use?.web_search_requests ?? 0})`);

// ===== CALL 2: CODE EXECUTION (Claude writes and runs Python) =====
const codeResponse = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    tools: [{ type: "code_execution_20260120", name: "code_execution" }],
    messages: [
        { role: "user", content: "Use Python to calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" },
    ],
});

console.log("\n=== CODE EXECUTION ===");
let codeAnswer = "";
for (const block of codeResponse.content) {
    if (block.type === "server_tool_use") {
        console.log(`🧪 Claude ran: ${JSON.stringify(block.input)}`);
    } else if (block.type === "bash_code_execution_tool_result") {
        console.log(`📤 stdout: ${block.content.stdout}`);
    } else if (block.type === "text") {
        codeAnswer += block.text;
    }
}
console.log(codeAnswer);