import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings, getCoordForVU } from "../config/setup.js";

const multiLocTrend = new Trend("Multi_Location_RunPoints_ms");

export function multiLocationPoints(params) {
  const coord = getCoordForVU(__VU);
  const url = ENDPOINTS.multiLocationPoints(coord);

  const res = http.get(url, params);
  recordTimings(res);
  multiLocTrend.add(res.timings.duration);
  check(res, { "Multi-location get run points": (r) => r.status === 200 });
  return res;
}
