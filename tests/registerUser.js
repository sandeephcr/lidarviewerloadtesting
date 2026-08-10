import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings, randomString } from "../config/setup.js";

const registerTrend = new Trend("Register_User_ms");

export function registerUser(params) {
  const rand = randomString(10);
  const registerPayload = {
    userName: `test2026${rand}`,
    email: `test2026${rand}@hcrobo.com`,
    password: "Cnsw-123",
    accountStatus: 1,
    origin: "https://testing.lidartechsolutions.com",
    designation: "Design Engineer",
    sites: [
      "https://qa.lidartechsolutions.com",
      "https://testing.lidartechsolutions.com",
    ],
    mailRequired: false,
  };

  const res = http.post(ENDPOINTS.registerUser, JSON.stringify(registerPayload), params);
  recordTimings(res);
  registerTrend.add(res.timings.duration);
  check(res, { "Register status 201": (r) => r.status === 201 });
  return res;
}
