import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const pcdDatTrend = new Trend("PCD_dat_ms");

export function pcdDat(params) {
  const res = http.get(ENDPOINTS.pcdDat, params);
  recordTimings(res);
  pcdDatTrend.add(res.timings.duration);
  check(res, { "PCD - dat file": (r) => r.status === 200 });
  return res;
}
