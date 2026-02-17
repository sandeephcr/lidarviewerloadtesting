import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { SharedArray } from "k6/data";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js";

// =======================================================
//  CAPACITY TEST – FIND VU WHERE P95 > 1s (UP TO 500 VUs)
// =======================================================

export const options = {
  scenarios: {
    capacity_test: {
      executor: "ramping-vus",
      startVUs: 50,
      stages: [
        { duration: "2m", target: 50 },
        { duration: "2m", target: 100 },
        { duration: "2m", target: 150 },
        { duration: "2m", target: 200 },
        { duration: "2m", target: 250 },
        { duration: "2m", target: 300 },
        { duration: "2m", target: 350 },
        { duration: "2m", target: 400 },
        { duration: "2m", target: 450 },
        { duration: "2m", target: 500 },
        { duration: "1m", target: 550 },
        { duration: "1m", target: 600 },
        { duration: "1m", target: 650 },  
        { duration: "1m", target: 750 },   // Hold peak load
        { duration: "1m", target: 800 },
        { duration: "1m", target: 850 },
        { duration: "1m", target: 1000 },     // Hold peak load

 // Hold peak load
   // Hold peak load
   // Hold peak load
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<1000"],  // Fail if P95 exceeds 1 second
  },

  noConnectionReuse: false, // KEEP CONNECTION REUSE ENABLED
};

// =======================================================
//  Metrics
// =======================================================

const waitingTrend = new Trend("waiting_response_ms");

// =======================================================
//  Load Tokens
// =======================================================

const tokenData = new SharedArray("accessTokens", function () {
  return JSON.parse(open("./data/accessTokens.json"));
});

const TOKEN_COUNT = tokenData.length;

function getTokenForVU(vuNumber) {
  const idx = (vuNumber - 1) % TOKEN_COUNT;
  return tokenData[idx].accessToken;
}

function buildParams(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    timeout: "60s",
  };
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const BASE_URL = "https://testing.lidartechsolutions.com";

// =======================================================
//  MAIN LOAD LOGIC
// =======================================================

export default function () {
  const ACCESS_TOKEN = getTokenForVU(__VU);
  const params = buildParams(ACCESS_TOKEN);

  const payload = {
    measurements: [
      {
        color: "#ffff00ff",
        type: "PtoPMeasurement",
        points: [
          {
            ecef_x: 776007.5420944849,
            ecef_y: -5635007.876002115,
            ecef_z: 2875666.935376984,
            identifier: "start",
          },
          {
            ecef_x: 776006.0849716828,
            ecef_y: -5635010.927562357,
            ecef_z: 2875661.5331824166,
            identifier: "end",
          },
        ],
        uuid: uuidv4(),
      },
    ],
  };

  // 1️⃣ DB WRITE
  const r1 = http.post(
    `${BASE_URL}/api/measurements/loc/1/Test-Oct30-3`,
    JSON.stringify(payload),
    params
  );

  waitingTrend.add(r1.timings.waiting);

  check(r1, {
    "Measurements OK": (r) => r.status === 200 || r.status === 201,
  });

  // 2️⃣ DB READ
  const r2 = http.get(
    `${BASE_URL}/api/filter_runs/lat_lng?lat=34.12710790205184&lng=-84.13815507646589&thresholdDistance=20`,
    params
  );

  waitingTrend.add(r2.timings.waiting);

  check(r2, {
    "Filter runs OK": (r) => r.status === 200,
  });

  // 3️⃣ DB READ
  const r3 = http.get(
    `${BASE_URL}/api/loc/0/equipment_sizes/`,
    params
  );

  waitingTrend.add(r3.timings.waiting);

  check(r3, {
    "Equipment sizes OK": (r) => r.status === 200,
  });

  // No sleep → maximum pressure
}

// =======================================================
//  HTML REPORT
// =======================================================

export function handleSummary(data) {
  return {
    "capacity_test_500_vus_report.html": htmlReport(data),
  };
}
