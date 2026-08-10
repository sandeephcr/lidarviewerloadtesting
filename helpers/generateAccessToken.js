import fs from 'fs/promises';
import { saveDataToJson } from './helpers.js';

const tokensFile = './tokens.json';
const tokens = JSON.parse(await fs.readFile(`data/${tokensFile}`, 'utf-8'));
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const url = 'https://testing.lidartechsolutions.com/api/login';

// Progress bar helper
function updateProgress(current, total) {
  const progress = (current / total) * 100;
  const barLength = 30;
  const filledLength = Math.round((progress / 100) * barLength);
  const bar = '#'.repeat(filledLength) + '-'.repeat(barLength - filledLength);

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`Generating tokens: [${bar}] ${current}/${total}`);
}

const responses = [];
let count = 0;

console.log("\nStarting Access Token Generation...\n");

for (const token of tokens) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: token })
  });

  responses.push(await res.json());

  count++;
  updateProgress(count, tokens.length);
}

await saveDataToJson(responses, 'data', 'accessTokens.json');

console.log(`\n✅ Completed! Generated ${responses.length} access tokens.`);