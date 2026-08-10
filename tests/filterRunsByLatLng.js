import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const filterRunsTrend = new Trend("Filter_runs_lat_lng_ms");

export function filterRunsByLatLng(params) {
  const res = http.get(ENDPOINTS.filterRunsByLatLng, params);
  recordTimings(res);
  filterRunsTrend.add(res.timings.duration);
  check(res, { "Filter runs by lat/lng status 200": (r) => r.status === 200 });
  return res;
}
