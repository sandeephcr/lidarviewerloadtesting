import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js";
import { buildParams, getTokenForVU } from "./config/setup.js";

import { folderStructure } from "./tests/folderStructure.js";
import { pointsLowDensity } from "./tests/pointsLowDensity.js";
import { pointsMediumDensity } from "./tests/pointsMediumDensity.js";
import { pointsHighDensity } from "./tests/pointsHighDensity.js";
import { pcdDat } from "./tests/pcdDat.js";
import { panorama } from "./tests/panorama.js";
import { measurementsPost } from "./tests/measurementsPost.js";
import { filterRunsByLatLng } from "./tests/filterRunsByLatLng.js";
import { equipmentSizes } from "./tests/equipmentSizes.js";
import { registerUser } from "./tests/registerUser.js";
import { multiLocationPoints } from "./tests/multiLocationPoints.js";
import { login } from "./tests/login.js";

// -------------------------
// Registry: maps a TEST name -> the function that runs it.
// Order here is also the order "all" runs in.
// -------------------------
const TEST_REGISTRY = {
  folderStructure,
  pointsLow: pointsLowDensity,
  pointsMedium: pointsMediumDensity,
  pointsHigh: pointsHighDensity,
  pcdDat,
  panorama,
  measurementsPost,
  filterRunsByLatLng,
  equipmentSizes,
  registerUser,
  multiLocationPoints,
  login,
};

const VALID_TEST_NAMES = Object.keys(TEST_REGISTRY);

// -------------------------
// VUS / DURATION — same as before, fully overridable via -e
// -------------------------
const DEFAULT_VUS = 100;
const DEFAULT_DURATION = "40s";

export const options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS, 10) : DEFAULT_VUS,
  duration: __ENV.DURATION || DEFAULT_DURATION,
};

// -------------------------
// TEST selection
// -e TEST=login                          -> just login
// -e TEST=login,folderStructure,panorama -> those 3, in that order
// -e TEST=all   (or omitted entirely)    -> all 12, registry order
// -------------------------
const SELECTED_TESTS = __ENV.TEST
  ? __ENV.TEST.split(",").map((t) => t.trim()).filter(Boolean)
  : ["all"];

function resolveTestsToRun() {
  if (SELECTED_TESTS.includes("all")) {
    return VALID_TEST_NAMES;
  }

  const unknown = SELECTED_TESTS.filter((name) => !TEST_REGISTRY[name]);
  if (unknown.length > 0) {
    throw new Error(
      `Unknown TEST name(s): ${unknown.join(", ")}. Valid options: ${VALID_TEST_NAMES.join(", ")}, all`
    );
  }

  return SELECTED_TESTS;
}

const TESTS_TO_RUN = resolveTestsToRun();

// -------------------------
// Default Test function
// -------------------------
export default function () {
  const accessToken = getTokenForVU(__VU);
  const params = buildParams(accessToken);

  TESTS_TO_RUN.forEach((name) => {
    TEST_REGISTRY[name](params);
  });
}

// -------------------------
// Generate Report
// -------------------------
export function handleSummary(data) {
  return {
    "index.html": htmlReport(data),
  };
}
