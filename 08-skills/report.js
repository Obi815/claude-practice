import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// A messy, real-looking activity log
const activityLog = `
Finished the login page UI. Fixed bug where password reset emails sent twice.
Started API rate limiting, about half done.
Still waiting on design team for the new dashboard mockups since Friday.
Reviewed Maria's search PR.
`;

const response = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 4096,
    // Attach the Skill
    container: {
        skills: [{ type: "custom", skill_id: process.env.STATUS_SKILL_ID, version: "latest" }],
    },
    // Required: Skills run inside code execution
    tools: [{ type: "code_execution_20250825", name: "code_execution" }],
    messages: [
        { role: "user", content: `Generate the daily status report from this activity log:\n\n${activityLog}` },
    ],
});

for (const block of response.content) {
    if (block.type === "server_tool_use") {
        console.log(`🧪 Claude ran: ${JSON.stringify(block.input)}`);
    } else if (block.type === "text") {
        console.log(block.text);
    }
}
console.log(`\n(stop_reason: ${response.stop_reason})`);