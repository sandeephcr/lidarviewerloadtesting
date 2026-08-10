import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";
import { ENDPOINTS } from "../config/endpoints.js";
import { recordTimings, uuidv4 } from "../config/setup.js";

const measurementsPostTrend = new Trend("Measurements_POST_ms");

function buildMeasurementsPayload() {
  return {
    measurements: [
      {
        color: "#ffff00ff",
        type: "PtoPMeasurement",
        points: [
          {
            ecef_x: 776007.5420944849,
            ecef_y: -5635007.876002115,
            ecef_z: 2875666.935376984,
            identifier: "start",
          },
          {
            ecef_x: 776006.0849716828,
            ecef_y: -5635010.927562357,
            ecef_z: 2875661.5331824166,
            identifier: "end",
          },
        ],
        uuid: uuidv4(),
      },
    ],
  };
}

export function measurementsPost(params) {
  const payload = buildMeasurementsPayload();
  const res = http.post(ENDPOINTS.measurementsPost, JSON.stringify(payload), params);
  check(res, { "Measurements POST status 200/201": (r) => r.status === 200 || r.status === 201 });
  measurementsPostTrend.add(res.timings.duration);
  recordTimings(res);
  return res;
}
