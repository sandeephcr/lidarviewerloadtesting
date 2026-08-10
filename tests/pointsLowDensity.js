import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const pointsLowDensityTrend = new Trend("Points_low_density_ms");

export function pointsLowDensity(params) {
  const res = http.get(ENDPOINTS.pointsLow, params);
  recordTimings(res);
  pointsLowDensityTrend.add(res.timings.duration);
  check(res, { "Points (low density)": (r) => r.status === 200 });
  return res;
}
