// generateAccessToken.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // keep for test envs with self-signed certs

import fs from "fs/promises";
import path from "path";

const TOKENS_FILE = path.join("data", "tokens.json");
const OUT_FILE = path.join("data", "accessTokens.json");
const LOGIN_URL = (process.env.BASE_URL || "https://testing.lidartechsolutions.com") + "/api/login";

const MAX_RETRIES = 4;
const REQUEST_TIMEOUT_MS = 15_000; // 15s per request
const RETRY_BASE_MS = 1000; // backoff base

console.log("Login URL:", LOGIN_URL);

async function loadTokens() {
  const raw = await fs.readFile(TOKENS_FILE, "utf-8");
  return JSON.parse(raw);
}

async function saveAccessTokens(arr) {
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(arr, null, 2), "utf-8");
  console.log(`💾 Saved: ${OUT_FILE} (count=${arr.length})`);
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function loginWithRetries(payload, idx) {
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const res = await fetchWithTimeout(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      }, REQUEST_TIMEOUT_MS);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
      }

      const json = await res.json();
      if (!json.accessToken) {
        throw new Error("No accessToken in response");
      }
      return { success: true, data: json };
    } catch (err) {
      attempt++;
      const isLast = attempt > MAX_RETRIES;
      console.warn(`[${idx}] attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (isLast) {
        return { success: false, error: err.message };
      }
      const backoff = RETRY_BASE_MS * Math.pow(2, attempt - 1);
      await sleep(backoff);
    }
  }
}

(async () => {
  try {
    const tokens = await loadTokens();
    console.log("Processing", tokens.length, "tokens...");

    const out = [];
    for (let i = 0; i < tokens.length; i++) {
      const tokenPayload = tokens[i];
      const result = await loginWithRetries(tokenPayload, i + 1);

      if (result.success) {
        out.push(result.data);
      } else {
        // store failure placeholder for debugging
        out.push({ error: result.error, index: i + 1 });
      }

      // save progress every 10 users
      if ((i + 1) % 10 === 0) {
        await saveAccessTokens(out);
        console.log(`Processed ${i + 1}/${tokens.length}`);
      }
    }

    // final save
    await saveAccessTokens(out);
    console.log("✅ Access token generation completed.");
  } catch (err) {
    console.error("Fatal error generating access tokens:", err);
    process.exit(1);
  }
})();
