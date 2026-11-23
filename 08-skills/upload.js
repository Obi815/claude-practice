import fs from 'fs';
import Anthropic, { toFile } from '@anthropic-ai/sdk';

const client = new Anthropic();

// Upload the SKILL.md inside a folder named after the skill
const skill = await client.skills.create({
    display_name: "Status Report Generator",
    files: [
        await toFile(fs.createReadStream("08-skills/status-report/SKILL.md"), "status-report/SKILL.md"),
    ],
});

console.log("Skill ID:", skill.id);