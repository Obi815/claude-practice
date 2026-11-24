import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.beta.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    messages: [
        { role: "user", content: "What tools do you have available? Then use one to list the main documentation topics for the GitHub repo anthropics/anthropic-sdk-typescript." },
    ],
    // 1. THE CONNECTION: where the MCP server lives
    mcp_servers: [
        { type: "url", url: "https://mcp.deepwiki.com/mcp", name: "deepwiki" },
    ],
    // 2. THE PERMISSION: which of its tools Claude can use (default = all)
    tools: [{ type: "mcp_toolset", mcp_server_name: "deepwiki" }],
    // MCP is in beta
    betas: ["mcp-client-2025-11-20"],
});

for (const block of response.content) {
    if (block.type === "mcp_tool_use") {
        console.log(`🔌 Claude called ${block.server_name}.${block.name}(${JSON.stringify(block.input)})`);
    } else if (block.type === "mcp_tool_result") {
        const text = block.content.map((c) => c.text ?? "").join(" ");
        console.log(`📥 Result: ${text.slice(0, 300)}...`);
    } else if (block.type === "text") {
        console.log(block.text);
    }
}