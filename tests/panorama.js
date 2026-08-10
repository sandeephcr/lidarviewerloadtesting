import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const panoramaTrend = new Trend("Panorama_jpg_ms");

export function panorama(params) {
  const res = http.get(ENDPOINTS.panorama, params);
  recordTimings(res);
  panoramaTrend.add(res.timings.duration);
  check(res, { "Panorama - jpg file": (r) => r.status === 200 });
  return res;
}
