import { Trend } from "k6/metrics";
import { SharedArray } from "k6/data";

// -------------------------
// Shared detailed timing metrics
// (recorded for every request, across every test module)
// -------------------------
const requestSentTrend = new Trend("request_sent_ms");
const waitingTrend = new Trend("waiting_response_ms");
const contentDownloadTrend = new Trend("content_download_ms");

export function recordTimings(res) {
  requestSentTrend.add(res.timings.sending);
  waitingTrend.add(res.timings.waiting);
  contentDownloadTrend.add(res.timings.receiving);
}

// -------------------------
// Access tokens (one per VU, looped if VUs > tokens)
// -------------------------
const tokenData = new SharedArray("accessTokens", function () {
  try {
    return JSON.parse(open("../data/accessTokens.json"));
  } catch (e) {
    return JSON.parse(open("../data/tokentest.json"));
  }
});

const TOKEN_COUNT = tokenData.length;
if (TOKEN_COUNT === 0) {
  throw new Error("No access tokens found in token JSON files!");
}

export function getTokenForVU(vuNumber) {
  const idx = (vuNumber - 1) % TOKEN_COUNT;
  return tokenData[idx].accessToken;
}

// -------------------------
// Request params (auth header, content type, timeout)
// -------------------------
const DEFAULT_TIMEOUT = "60s";

export function buildParams(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    timeout: DEFAULT_TIMEOUT,
  };
}

// -------------------------
// Coordinates for multi-location points test
// -------------------------
export const coordinates = new SharedArray("coords", function () {
  return JSON.parse(open("../data/runCoordinates.json"));
});

export const COORD_COUNT = coordinates.length;

export function getCoordForVU(vuNumber) {
  const idx = (vuNumber - 1) % COORD_COUNT;
  return coordinates[idx];
}

// -------------------------
// User credentials for login test
// -------------------------
export const userData = new SharedArray("userData", function () {
  return JSON.parse(open("../data/users.json"));
});

export function getUserForVU(vuNumber) {
  const idx = (vuNumber - 1) % userData.length;
  return userData[idx];
}

// -------------------------
// Utilities
// -------------------------
export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function randomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
