import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const pointsMediumDensityTrend = new Trend("Points_medium_density_ms");

export function pointsMediumDensity(params) {
  const res = http.get(ENDPOINTS.pointsMedium, params);
  recordTimings(res);
  pointsMediumDensityTrend.add(res.timings.duration);
  check(res, { "Points (medium density)": (r) => r.status === 200 });
  return res;
}
