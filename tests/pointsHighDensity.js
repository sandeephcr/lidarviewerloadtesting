import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const pointsHighDensityTrend = new Trend("Points_high_density_ms");

export function pointsHighDensity(params) {
  const res = http.get(ENDPOINTS.pointsHigh, params);
  recordTimings(res);
  pointsHighDensityTrend.add(res.timings.duration);
  check(res, { "Points (high density)": (r) => r.status === 200 });
  return res;
}
