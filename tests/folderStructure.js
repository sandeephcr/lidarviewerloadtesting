import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings } from "../config/setup.js";

const folderStructureTrend = new Trend("Folder_Structure_ms");

export function folderStructure(params) {
  const res = http.get(ENDPOINTS.folderStructure, params);
  recordTimings(res);
  folderStructureTrend.add(res.timings.duration);
  check(res, { "Folder structure status": (r) => r.status === 200 });
  return res;
}
