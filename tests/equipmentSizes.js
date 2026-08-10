import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const equipmentSizesTrend = new Trend("Equipment_Sizes_ms");

export function equipmentSizes(params) {
  const res = http.get(ENDPOINTS.equipmentSizes, params);
  recordTimings(res);
  equipmentSizesTrend.add(res.timings.duration);
  check(res, { "Equipment Sizes status": (r) => r.status === 200 });

  // NOTE: preserved from the original script, where sleep(1) occurred
  // immediately after this check and before the Register User step.
  sleep(1);

  return res;
}
