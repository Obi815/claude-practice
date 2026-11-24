import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.beta.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    messages: [
            { role: "user", content: "Ask DeepWiki: how do I stream responses with the anthropics/anthropic-sdk-typescript SDK?" },
    ],
    // 1. THE CONNECTION: where the MCP server lives
    mcp_servers: [
        { type: "url", url: "https://mcp.deepwiki.com/mcp", name: "deepwiki" },
    ],
    tools: [{
        type: "mcp_toolset",
        mcp_server_name: "deepwiki",
        default_config: { enabled: false },           // turn everything off
        configs: {
            read_wiki_structure: { enabled: true },   // allow only this one
        },
    }],
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