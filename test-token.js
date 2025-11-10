import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://testing.lidartechsolutions.com";
const token = JSON.parse(open("data/accessTokens.json"))[0]; // first token

export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const res = http.get(`${BASE_URL}/api/me`, params);
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${res.body.substring(0, 100)}`);

  check(res, { "status is 200": (r) => r.status === 200 });
}
