process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import fs from 'fs/promises'
import { saveDataToJson } from './helpers.js';

const tokensFile = './tokens.json';
const tokens = JSON.parse(await fs.readFile(`data/${tokensFile}`, 'utf-8'));
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// API endpoint
const url = 'http://testing.lidartechsolutions.com/api/login'; 

// Loop through each token and send as payload
const responses = [];
for (const token of tokens) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: token })
  });
  responses.push(await res.json());
}
await saveDataToJson(responses, 'data', 'accessTokens.json')
