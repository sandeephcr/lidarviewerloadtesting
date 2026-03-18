import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { SharedArray } from "k6/data";
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';

const DEFAULT_VUS = 200;
const DEFAULT_DURATION = "5m";

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS, 10) : DEFAULT_VUS,
  duration: __ENV.DURATION || DEFAULT_DURATION,
};

// -------------------------
// Existing Metrics
// -------------------------
const folderStructureTrend = new Trend("Folder_Structure_ms");
const pointsLowDensityTrend = new Trend("Points_low_density_ms");
const pointsMediumDensityTrend = new Trend("Points_medium_density_ms");
const pointsHighDensityTrend = new Trend("Points_high_density_ms");
const pcdDatTrend = new Trend("PCD_dat_ms");
const panoramaTrend = new Trend("Panorama_jpg_ms");
const measurementsPostTrend = new Trend("Measurements_POST_ms");
const filterRunsTrend = new Trend("Filter_runs_lat_lng_ms");
const equipmentSizesTrend = new Trend("Equipment_Sizes_ms");



// -------------------------
//  New Detailed Timing Trends
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
  
   measurementsPost:
   "https://testing.lidartechsolutions.com/api/measurements/loc/1/Test-Oct30-3",

   filterRunsByLatLng:
  "https://testing.lidartechsolutions.com/api/filter_runs/lat_lng?lat=34.12710790205184&lng=-84.13815507646589&thresholdDistance=20",

  equipmentSizes:
  "https://testing.lidartechsolutions.com/api/loc/0/equipment_sizes/",


};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


// -------------------------
// Default Test function
// -------------------------
export default function () {
  const ACCESS_TOKEN = getTokenForVU(__VU);
  const params = buildParams(ACCESS_TOKEN);

  function recordTimings(res) {
    
    // Add detailed timings for every request
    // console.log(res.timings);
    requestSentTrend.add(res.timings.sending);
    waitingTrend.add(res.timings.waiting);
    contentDownloadTrend.add(res.timings.receiving);
  }

  const measurementsPayload = {
  measurements: [ 
    {
  "color": "#ffff00ff",
  "type": "PtoPMeasurement",
  "points": [
    {
      "ecef_x": 776007.5420944849,
      "ecef_y": -5635007.876002115,
      "ecef_z": 2875666.935376984,
      "identifier": "start"
    },
    {
      "ecef_x": 776006.0849716828,
      "ecef_y": -5635010.927562357,
      "ecef_z": 2875661.5331824166,
      "identifier": "end"
    }
  ],
  "uuid": uuidv4(),
}
  ]
};

  // 1️ Folder Structure
  const r1 = http.get(ENDPOINTS.folderStructure, params);
  recordTimings(r1);
  folderStructureTrend.add(r1.timings.duration);
  check(r1, { "Folder structure status": (r) => r.status === 200 });

  // 2️ Points - Low Density
  const r2 = http.get(ENDPOINTS.pointsLow, params);
  recordTimings(r2);
  pointsLowDensityTrend.add(r2.timings.duration);
  check(r2, { "Points (low density)": (r) => r.status === 200 });

  // 3️ Points - Medium Density
  const r3 = http.get(ENDPOINTS.pointsMedium, params);
  recordTimings(r3);
  pointsMediumDensityTrend.add(r3.timings.duration);
  check(r3, { "Points (medium density)": (r) => r.status === 200 });

  // 4️ Points - High Density
  const r4 = http.get(ENDPOINTS.pointsHigh, params);
  recordTimings(r4);
  pointsHighDensityTrend.add(r4.timings.duration);
  check(r4, { "Points (high density)": (r) => r.status === 200 });

  // 5️ PCD
  const r5 = http.get(ENDPOINTS.pcdDat, params);
  recordTimings(r5);
  pcdDatTrend.add(r5.timings.duration);
  check(r5, { "PCD - dat file": (r) => r.status === 200 });

  // 6️ Panorama
  const r6 = http.get(ENDPOINTS.panorama, params);
  recordTimings(r6);
  panoramaTrend.add(r6.timings.duration);
  check(r6, { "Panorama - jpg file": (r) => r.status === 200 });

  // 7 Measurements

  const r7 = http.post(
  ENDPOINTS.measurementsPost,
  JSON.stringify(measurementsPayload),
  params
  );

  check(r7, { "Measurements POST status 200/201": (r) => r.status === 200 || r.status === 201 });
  measurementsPostTrend.add(r7.timings.duration);
  recordTimings(r7);

  // 8 Search by Lat Long

  const r8 = http.get(ENDPOINTS.filterRunsByLatLng, params);
  recordTimings(r8);
  filterRunsTrend.add(r8.timings.duration);

  check(r8, {
    "Filter runs by lat/lng status 200": (r) => r.status === 200,
  });

  // 9 Equipment Sizes
  const r9 = http.get(ENDPOINTS.equipmentSizes, params);
  recordTimings(r9);
  equipmentSizesTrend.add(r9.timings.duration);
  check(r9, { "Equipment Sizes status": (r) => r.status === 200 });

  sleep(1);
}

// -------------------------
// Generate Report
// -------------------------
export function handleSummary(data) {
  return {
    "index.html": htmlReport(data),
  };
}