/*import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { SharedArray } from "k6/data";
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js'

// -------------------------
// Setup custom metrics
// -------------------------
const folderStructureTrend = new Trend("Folder_Structure_ms");
const points50MTrend = new Trend("Points_low_density_ms");
const points5MTrend = new Trend("Points_medium_density_ms");
const points10MTrend = new Trend("Points_high_density_ms");
const pcdDatTrend = new Trend("PCD_dat_ms");
const panoramaTrend = new Trend("Panorama_ms");

// -------------------------
// K6 options
// -------------------------
export const options = {
  vus: 1200,         // 400 users
  duration: "8m",  // each VU runs once
  //iterations: 40
};

// -------------------------
// Load all tokens
// -------------------------
const tokenData = new SharedArray("accessTokens", function () {
  return JSON.parse(open("data/accessTokens.json"));
});
//console.log("Toke data is", tokenData.length)

// -------------------------
// Default test function
// -------------------------
export default function () {
  // Pick token based on VU number
  // console.log("Before access token",__VU);  
  const ACCESS_TOKEN = tokenData[__VU - 1]?.accessToken;
  // console.log("Access token", tokenData[__VU - 1].accessToken);
  // console.log("After access token",__VU);  

  if(!ACCESS_TOKEN){
    console.error(`No valid access token for the VUser: ${__VU - 1}`)
    return;
  }
  const params = {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    timeout: "60s",
  };

  // 1️⃣ Folder Structure
  let res1 = http.get(
    "https://testing.lidartechsolutions.com/admin/runsFolderStructure?folderId=68f9f52e8d7e694d6c15d8c4",
    params
  );
  check(res1, { "Folder structure status 200": (r) => r.status === 200 });
  folderStructureTrend.add(res1.timings.duration);

  // 2️⃣ Points - low density
  let res2 = http.get(
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.50",
    params
  );
  check(res2, { "Points(50M) status 200": (r) => r.status === 200 });
  points50MTrend.add(res2.timings.duration);

  // 3️⃣ Points - medium density
  let res3 = http.get(
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.25",
    params
  );
  check(res3, { "Points(5M) status 200": (r) => r.status === 200 });
  points5MTrend.add(res3.timings.duration);

  // 4️⃣ Points - high density
  let res4 = http.get(
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.00",
    params
  );
  check(res4, { "Points(10M) status 200": (r) => r.status === 200 });
  points10MTrend.add(res4.timings.duration);

  // 5️⃣ PCD Tile (.dat)
  let res5 = http.get(
    "https://testing.lidartechsolutions.com/x/loc/Test-Oct30-3/Points/5455819325/6_20_5_0.dat",
    params
  );
  check(res5, { ".dat Load status 200": (r) => r.status === 200 });
  pcdDatTrend.add(res5.timings.duration);

  // 6️⃣ Panorama Image
  let res6 = http.get(
    "https://testing.lidartechsolutions.com/x/loc/Test-Oct30-3/Panoramas/stream_00000055/0_1.jpg",
    params
  );
  check(res6, { "Panorama .jpg status 200": (r) => r.status === 200 });
  panoramaTrend.add(res6.timings.duration);

  sleep(1);
}

// -------------------------
// Customize summary at end
// -------------------------
export function handleSummary(data) {
  return {
    'index.html': htmlReport(data),
    stdout: `
======= Response Time Summary (ms) =======
Folder Structure - avg: ${data.metrics.Folder_Structure_ms.avg}, min: ${data.metrics.Folder_Structure_ms.min}, max: ${data.metrics.Folder_Structure_ms.max}
Points(50M)      - avg: ${data.metrics.Points_50M_ms.avg}, min: ${data.metrics.Points_50M_ms.min}, max: ${data.metrics.Points_50M_ms.max}
Points(5M)       - avg: ${data.metrics.Points_5M_ms.avg}, min: ${data.metrics.Points_5M_ms.min}, max: ${data.metrics.Points_5M_ms.max}
Points(10M)      - avg: ${data.metrics.Points_10M_ms.avg}, min: ${data.metrics.Points_10M_ms.min}, max: ${data.metrics.Points_10M_ms.max}
PCD .dat         - avg: ${data.metrics.PCD_dat_ms.avg}, min: ${data.metrics.PCD_dat_ms.min}, max: ${data.metrics.PCD_dat_ms.max}
Panorama         - avg: ${data.metrics.Panorama_ms.avg}, min: ${data.metrics.Panorama_ms.min}, max: ${data.metrics.Panorama_ms.max}
==========================================
`,
  };
}
*/






/*
import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { SharedArray } from "k6/data";
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';

const DEFAULT_VUS = 1200;
const DEFAULT_DURATION = "4m";

// k6 options: allow CLI overrides (k6 merges cli --vus/--duration with options)
export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS, 10) : DEFAULT_VUS,
  duration: __ENV.DURATION || DEFAULT_DURATION,
  // if you prefer to control via options directly, set here instead of CLI
};

// -------------------------
// Metrics (per API)
// -------------------------
const folderStructureTrend = new Trend("Folder_Structure_ms");
const pointsLowDensityTrend = new Trend("Points_low_density_ms");
const pointsMediumDensityTrend = new Trend("Points_medium_density_ms");
const pointsHighDensityTrend = new Trend("Points_high_density_ms");
const pcdDatTrend = new Trend("PCD_dat_ms");
const panoramaTrend = new Trend("Panorama_ms");


// -------------------------
const tokenData = new SharedArray("accessTokens", function () {
  // change path if your file is named differently (tokentest.json / tokentest.json)
  try {
    return JSON.parse(open("./data/accessTokens.json"));
  } catch (e) {
    // fallback name that you might have used earlier
    return JSON.parse(open("./data/tokentest.json"));
  }
});

const TOKEN_COUNT = tokenData.length;

// quick check at init time (k6 will error early if no tokens)
if (TOKEN_COUNT === 0) {
  // This will make the script fail fast with a clear message
  throw new Error("No access tokens found in ./data/accessTokens.json or ./data/tokentest.json");
}

// -------------------------
// Per-VU token selection (round-robin)
// -------------------------
function getTokenForVU(vuNumber) {
  // __VU is 1-based; convert to 0-based index and cycle using modulo
  const idx = (vuNumber - 1) % TOKEN_COUNT;
  return tokenData[idx].accessToken;
}

// -------------------------
// Shared params for all requests
// -------------------------
const DEFAULT_TIMEOUT = "60s"; // per-request timeout

function buildParams(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    timeout: DEFAULT_TIMEOUT,
  };
}

// -------------------------
// API endpoints (update as needed)
// -------------------------
const ENDPOINTS = {
  folderStructure:
    "https://testing.lidartechsolutions.com/admin/runsFolderStructure?folderId=68f9f52e8d7e694d6c15d8c4",
  pointsLow:
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.50",
  pointsMedium:
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.25",
  pointsHigh:
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.00",
  pcdDat:
    "https://testing.lidartechsolutions.com/x/loc/Test-Oct30-3/Points/5455819325/6_20_5_0.dat",
  panorama:
    "https://testing.lidartechsolutions.com/x/loc/Test-Oct30-3/Panoramas/stream_00000055/0_1.jpg",
};

// -------------------------
// Test scenario (default function)
// Each VU will loop for the duration (controlled by options.duration)
// -------------------------
export default function () {
  const ACCESS_TOKEN = getTokenForVU(__VU);
  if (!ACCESS_TOKEN) {
    // log and exit this VU's iteration early if no token
    console.error(`No token assigned for VU ${__VU}`);
    return;
  }
  const params = buildParams(ACCESS_TOKEN);

  // 1️⃣ Folder Structure
  const r1 = http.get(ENDPOINTS.folderStructure, params);
  check(r1, { "Folder structure status 200": (r) => r.status === 200 });
  folderStructureTrend.add(r1.timings.duration);

  // 2️⃣ Points - low density
  const r2 = http.get(ENDPOINTS.pointsLow, params);
  check(r2, { "Points (low density) status 200": (r) => r.status === 200 });
  pointsLowDensityTrend.add(r2.timings.duration);

  // 3️⃣ Points - medium density
  const r3 = http.get(ENDPOINTS.pointsMedium, params);
  check(r3, { "Points (medium density) status 200": (r) => r.status === 200 });
  pointsMediumDensityTrend.add(r3.timings.duration);

  // 4️⃣ Points - high density
  const r4 = http.get(ENDPOINTS.pointsHigh, params);
  check(r4, { "Points (high density) status 200": (r) => r.status === 200 });
  pointsHighDensityTrend.add(r4.timings.duration);

  // 5️⃣ PCD Tile (.dat)
  const r5 = http.get(ENDPOINTS.pcdDat, params);
  check(r5, { ".dat Load status 200": (r) => r.status === 200 });
  pcdDatTrend.add(r5.timings.duration);

  // 6️⃣ Panorama Image
  const r6 = http.get(ENDPOINTS.panorama, params);
  check(r6, { "Panorama .jpg status 200": (r) => r.status === 200 });
  panoramaTrend.add(r6.timings.duration);

  // Small think time between iterations to simulate user pacing
  sleep(1);
}

// -------------------------
// Summary + HTML report
// -------------------------
export function handleSummary(data) {
  // safe getters with fallback
  const getMetric = (name) => {
    const m = data.metrics[name];
    return {
      avg: m && m.avg ? Number(m.avg).toFixed(2) : "0.00",
      min: m && m.min ? Number(m.min).toFixed(2) : "0.00",
      max: m && m.max ? Number(m.max).toFixed(2) : "0.00",
    };
  };

  const folder = getMetric("Folder_Structure_ms");
  const plow = getMetric("Points_low_density_ms");
  const pmed = getMetric("Points_medium_density_ms");
  const phigh = getMetric("Points_high_density_ms");
  const pcd = getMetric("PCD_dat_ms");
  const pano = getMetric("Panorama_ms");

  const textSummary = `
======= Response Time Summary (ms) =======
Folder Structure - avg: ${folder.avg}, min: ${folder.min}, max: ${folder.max}
Points (low density)  - avg: ${plow.avg}, min: ${plow.min}, max: ${plow.max}
Points (medium density) - avg: ${pmed.avg}, min: ${pmed.min}, max: ${pmed.max}
Points (high density) - avg: ${phigh.avg}, min: ${phigh.min}, max: ${phigh.max}
PCD .dat         - avg: ${pcd.avg}, min: ${pcd.min}, max: ${pcd.max}
Panorama         - avg: ${pano.avg}, min: ${pano.min}, max: ${pano.max}
==========================================
`;

  return {
    "summary.html": htmlReport(data),
    stdout: textSummary,
  };
}
*/




import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { SharedArray } from "k6/data";
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';

const DEFAULT_VUS = 1200;
const DEFAULT_DURATION = "4m";

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS, 10) : DEFAULT_VUS,
  duration: __ENV.DURATION || DEFAULT_DURATION,
};

// -------------------------
// ✅ Existing Metrics
// -------------------------
const folderStructureTrend = new Trend("Folder_Structure_ms");
const pointsLowDensityTrend = new Trend("Points_low_density_ms");
const pointsMediumDensityTrend = new Trend("Points_medium_density_ms");
const pointsHighDensityTrend = new Trend("Points_high_density_ms");
const pcdDatTrend = new Trend("PCD_dat_ms");
const panoramaTrend = new Trend("Panorama_ms");

// -------------------------
// ✅ New Detailed Timing Trends (for DevTools mapping)
// -------------------------
const requestSentTrend = new Trend("request_sent_ms");
const waitingTrend = new Trend("waiting_response_ms");
const contentDownloadTrend = new Trend("content_download_ms");


// -------------------------
const tokenData = new SharedArray("accessTokens", function () {
  try {
    return JSON.parse(open("./data/accessTokens.json"));
  } catch (e) {
    return JSON.parse(open("./data/tokentest.json"));
  }
});

const TOKEN_COUNT = tokenData.length;
if (TOKEN_COUNT === 0) {
  throw new Error("No access tokens found in token JSON files!");
}

function getTokenForVU(vuNumber) {
  const idx = (vuNumber - 1) % TOKEN_COUNT;
  return tokenData[idx].accessToken;
}

const DEFAULT_TIMEOUT = "60s";
function buildParams(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    timeout: DEFAULT_TIMEOUT,
  };
}

const ENDPOINTS = {
  folderStructure:
    "https://testing.lidartechsolutions.com/admin/runsFolderStructure?folderId=68f9f52e8d7e694d6c15d8c4",
  pointsLow:
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.50",
  pointsMedium:
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.25",
  pointsHigh:
    "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.00",
  pcdDat:
    "https://testing.lidartechsolutions.com/x/loc/Test-Oct30-3/Points/5455819325/6_20_5_0.dat",
  panorama:
    "https://testing.lidartechsolutions.com/x/loc/Test-Oct30-3/Panoramas/stream_00000055/0_1.jpg",
};


// -------------------------
// Default Test function
// -------------------------
export default function () {
  const ACCESS_TOKEN = getTokenForVU(__VU);
  const params = buildParams(ACCESS_TOKEN);

  function recordTimings(res) {
    // ✅ Add detailed timings for every request
    requestSentTrend.add(res.timings.sending);
    waitingTrend.add(res.timings.waiting);
    contentDownloadTrend.add(res.timings.receiving);
  }

  // 1️⃣ Folder Structure
  const r1 = http.get(ENDPOINTS.folderStructure, params);
  recordTimings(r1);
  folderStructureTrend.add(r1.timings.duration);
  check(r1, { "Folder structure status 200": (r) => r.status === 200 });

  // 2️⃣ Points - Low
  const r2 = http.get(ENDPOINTS.pointsLow, params);
  recordTimings(r2);
  pointsLowDensityTrend.add(r2.timings.duration);
  check(r2, { "Points (low) 200": (r) => r.status === 200 });

  // 3️⃣ Medium
  const r3 = http.get(ENDPOINTS.pointsMedium, params);
  recordTimings(r3);
  pointsMediumDensityTrend.add(r3.timings.duration);
  check(r3, { "Points (medium) 200": (r) => r.status === 200 });

  // 4️⃣ High
  const r4 = http.get(ENDPOINTS.pointsHigh, params);
  recordTimings(r4);
  pointsHighDensityTrend.add(r4.timings.duration);
  check(r4, { "Points (high) 200": (r) => r.status === 200 });

  // 5️⃣ PCD
  const r5 = http.get(ENDPOINTS.pcdDat, params);
  recordTimings(r5);
  pcdDatTrend.add(r5.timings.duration);
  check(r5, { ".dat 200": (r) => r.status === 200 });

  // 6️⃣ Panorama
  const r6 = http.get(ENDPOINTS.panorama, params);
  recordTimings(r6);
  panoramaTrend.add(r6.timings.duration);
  check(r6, { "Panorama 200": (r) => r.status === 200 });

  sleep(1);
}


// -------------------------
// ✅ Updated Summary Section
// -------------------------
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
    stdout: `
==== Timing Breakdown (ms) ====
Request Sent (TCP+TLS) → request_sent_ms
Waiting (TTFB) → waiting_response_ms
Content Download → content_download_ms
===============================
`,
  };
}


