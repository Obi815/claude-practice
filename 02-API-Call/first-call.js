import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const buggyCode = `
function add(a, b) {
    return a - b
}
`;

const msg = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    system: "You are a terse senior code reviewer. Give feedback in one paragraph.",
    messages: [
        { role: "user", content: `Review this code:\n${buggyCode}` },
    ],
})

for (const block of msg.content){
    if (block.type === "text"){
        console.log(block.text)
    }
}