import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";
import { SharedArray } from "k6/data";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// Metrics
const loginTime = new Trend("login_time");
const successRate = new Rate("success_rate");
const loginSuccess = new Counter("login_success");
const loginFailure = new Counter("login_failure");

// Load encrypted tokens from external JSON file
const encryptedTokens = new SharedArray("encrypted_tokens", function () {
  return JSON.parse(open("tokens.json")); // expects an array of encrypted tokens
});

const BASE_URL = __ENV.BASE_URL || "https://testing.lidartechsolutions.com";
const LOGIN_URL = `${BASE_URL}/api/login`;

// Test Options
export const options = {
  scenarios: {
    stage_1: {
      executor: "per-vu-iterations",
      vus: 100,
      iterations: 1,
      startTime: "0s",
    },
    stage_2: {
      executor: "per-vu-iterations",
      vus: 100,
      iterations: 1,
      startTime: "30s",
    },
    stage_3: {
      executor: "per-vu-iterations",
      vus: 100,
      iterations: 1,
      startTime: "60s",
    },
    stage_4: {
      executor: "per-vu-iterations",
      vus: 100,
      iterations: 1,
      startTime: "90s",
    },
  },
  thresholds: {
    success_rate: ["rate>0.95"],
    login_time: ["p(95)<3000"],
  },
};

// To store detailed request logs for JSON report
let requestLogs = [];

// Test Execution
export default function () {
  const tokenIndex = (__VU - 1) % encryptedTokens.length;
  const encryptedData = encryptedTokens[tokenIndex];

  if (!encryptedData) {
    console.error(`⚠️ No token found for VU ${__VU}`);
    return;
  }

  // Introduce small stagger delay (simulate gradual real user behavior)
  const delay = tokenIndex * 0.2; // 200ms gap between each user start
  sleep(delay);

  const payload = { data: encryptedData };
  const params = { headers: { "Content-Type": "application/json" } };

  console.log(`VU ${__VU} sending login request after ${delay.toFixed(1)}s...`);

  const start = Date.now();
  const res = http.post(LOGIN_URL, JSON.stringify(payload), params);
  const end = Date.now();

  const duration = end - start;
  loginTime.add(duration);

  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "response has accessToken": (r) => r.body && r.body.includes("accessToken"),
  });

  successRate.add(ok);

  if (ok) {
    loginSuccess.add(1);
    console.log(`✅ VU ${__VU} success [${res.status}] | ${duration}ms`);
  } else {
    loginFailure.add(1);
    console.error(`❌ VU ${__VU} failed [${res.status}] | ${res.body}`);
  }

  // Save each request for custom JSON report
  requestLogs.push({
    vu: __VU,
    token_index: tokenIndex,
    status: res.status,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
    success: ok,
  });

  sleep(1);
}

// Custom Summary Report
export function handleSummary(data) {
  const jsonData = {
    summary: {
      total_iterations: data.metrics.iterations?.values?.count || 0,
      success: data.metrics.login_success?.values?.count || 0,
      failures: data.metrics.login_failure?.values?.count || 0,
      success_rate: (
        data.metrics.success_rate?.values?.rate * 100 || 0
      ).toFixed(2),
      p95_login_time: (data.metrics.login_time?.values?.p95 || 0).toFixed(2),
      total_vus: Object.values(options.scenarios).reduce(
        (sum, s) => sum + s.vus,
        0
      ),
      test_end_time: new Date().toISOString(),
    },
    detailed_requests: requestLogs,
  };

  return {
    // ✅ Interactive HTML report
    "data/login-progressive-report.html": htmlReport(data),

    // ✅ JSON file with detailed results
    "data/login-progressive-details.json": JSON.stringify(jsonData, null, 2),

    // ✅ Console summary
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
