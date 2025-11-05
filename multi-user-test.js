import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { SharedArray } from "k6/data";
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js'

// -------------------------
// Setup custom metrics
// -------------------------
const folderStructureTrend = new Trend("Folder_Structure_ms");
const points50MTrend = new Trend("Points_50M_ms");
const points5MTrend = new Trend("Points_5M_ms");
const points10MTrend = new Trend("Points_10M_ms");
const pcdDatTrend = new Trend("PCD_dat_ms");
const panoramaTrend = new Trend("Panorama_ms");

// -------------------------
// K6 options
// -------------------------
export const options = {
  vus: 400,         // 400 users
  duration: "30s",  // each VU runs once
};

// -------------------------
// Load all tokens
// -------------------------
const tokenData = new SharedArray("accessTokens", function () {
  return JSON.parse(open("data/accessTokens.json"));
});
console.log("Toke data is", tokenData.length)

// -------------------------
// Default test function
// -------------------------
export default function () {
  // Pick token based on VU number
  // console.log("Before access token",__VU);  
  const ACCESS_TOKEN = tokenData[__VU - 1].accessToken;
  // console.log("Access token", tokenData[__VU - 1].accessToken);
   console.log("After access token",__VU);  
  const params = {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
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
    'summary.html': htmlReport(data),
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

