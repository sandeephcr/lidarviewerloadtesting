import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { getUserForVU } from "../config/setup.js";

const loginTrend = new Trend("Login_API_ms");

// NOTE: preserved from the original script — login does NOT use the shared
// Authorization/access-token params that every other test uses. It builds
// its own headers and sends { data: user } as the payload.
export function login(_params) {
  const user = getUserForVU(__VU);
  const payload = { data: user };

  console.log(`VU ${__VU} Iter ${__ITER} Login Payload:`, JSON.stringify(payload));

  const res = http.post(ENDPOINTS.login, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
    timeout: "60s",
  });

  loginTrend.add(res.timings.duration);
  check(res, {
    "Login status 200": (r) => r.status === 200,
    "Access token present": (r) => !!r.json("accessToken"),
  });
  return res;
}
