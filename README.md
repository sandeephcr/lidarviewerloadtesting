# lidarviewerloadtesting
LidarViewerLoadTesting


# Token Generation & Load Testing Project

This project automates the process of generating authentication tokens, converting them into access tokens, and then using those tokens to run performance or functional tests (e.g., via k6).  

The workflow is divided into three main scripts:

1. `npm run generate-tokens`
2. `npm run generate-access-tokens`
3. `npm run start`
4. `npm run view-report`

Each script builds on the output of the previous one to ensure the environment is correctly prepared before executing the main logic.

---

## Project Overview

This repository contains Node.js scripts that help automate the token-based login process used for testing APIs.  
It is especially useful in test environments where you need to:
- Generate multiple authentication tokens.
- Convert them into access tokens via an API.
- Run automated load or functional tests using those tokens.

---

## Prerequisites

Before running any script, ensure the following are installed and configured:

- [Node.js](https://nodejs.org/) v18 or higher  
- npm (comes bundled with Node.js)  
- Network access to your test API endpoint (e.g., `https://testing.lidartechsolutions.com/api/login`)  
- Proper `.env` file or environment variables (if required)
- Install k6 in the machine under test

---

## 1. `npm run generate-tokens`

### **Description**
This script is responsible for generating or refreshing the base encrypted tokens used for login;  

Typically, these are temporary or user-level tokens required before exchanging them for access tokens.

### **Usage**
```npm run generate-tokens ```

##  2. `npm run generate-access-tokens`

### **Description**
This script takes the tokens created by `generate-tokens` and exchanges them for **access tokens** by sending each one to the configured API endpoint.  

It is often used in test setups where tokens must be validated or converted before execution of automated tests.

### **Usage**
```npm run generate-access-tokens```


## 3. `npm run start`

### **Description**
This command runs the **main execution script** of the project.  
It is typically used to start the automated test suite or load testing process — most commonly using **k6**, a modern load testing tool.

The `npm run start` command internally triggers the `k6 run` command with the specified test file (for example, `multi-user-test.js`), executing the configured performance or functional test scenario.

---

### **Usage**
```npm run start```

## 4. `npm run view-report`

### **Description**
This command runs the **report launch** of the project located in the root directory with name index.html.

It is typically used to launch the report in the browser

---

### **Usage**
```npm run view-report```

---

## Running individual tests (new)

`multi-user-test.js` is now a thin dispatcher. Each of the 12 API checks lives
in its own file under `tests/`, and shared config (endpoints, tokens, users,
coordinates, helpers) lives under `config/`.

```
config/
  endpoints.js   # all endpoint URLs
  setup.js       # buildParams, token/user/coord lookups, uuidv4, randomString
tests/
  folderStructure.js
  pointsLowDensity.js
  pointsMediumDensity.js
  pointsHighDensity.js
  pcdDat.js
  panorama.js
  measurementsPost.js
  filterRunsByLatLng.js
  equipmentSizes.js
  registerUser.js
  multiLocationPoints.js
  login.js
multi-user-test.js  # entry point / dispatcher
```

Use the `TEST` env var to pick which test(s) run, and `VUS` / `DURATION` to
control load — all fully overridable per run, no file editing needed.

### Valid TEST names
`folderStructure`, `pointsLow`, `pointsMedium`, `pointsHigh`, `pcdDat`,
`panorama`, `measurementsPost`, `filterRunsByLatLng`, `equipmentSizes`,
`registerUser`, `multiLocationPoints`, `login`, or `all`.

### How to run

`npm run start` still works exactly as before — it runs **all 12 tests**
with the default VUs/duration (100 VUs, 40s) and the live web dashboard.

For any custom combination of `TEST` / `VUS` / `DURATION`, call `k6 run`
**directly** rather than through an `npm run` wrapper. On Windows in
particular, `npm run <script> -- -e ...` appends your flags *after* the
script filename in the resolved command, and k6 requires `-e` flags to come
*before* the file — so npm-wrapped custom runs can silently no-op or fail to
resolve `cross-env`. Calling `k6 run` directly avoids all of that.

```bash
# Run everything (same as npm run start, minus the dashboard)
k6 run multi-user-test.js

# Run just one test, with custom VUs/duration

k6 run -e TEST=login -e VUS=20 -e DURATION=30s multi-user-test.js

# Run a handful of tests together (order follows the order listed)
k6 run -e TEST=login,folderStructure,pointsLow,panorama,equipmentSizes -e VUS=50 -e DURATION=1m multi-user-test.js

# Explicitly run all 12 (equivalent to omitting TEST)
k6 run -e TEST=all -e VUS=100 -e DURATION=40s multi-user-test.js
```

The `handleSummary` report (`index.html`) is generated on every run
regardless of whether the live dashboard is enabled, so `npm run view-report`
works the same way after any of the commands above.

An unknown `TEST` name throws an error at startup and lists the valid names,
so a typo won't silently run the wrong thing (or everything).

### Full workflow

```bash
npm run generate-tokens
npm run generate-access-tokens
k6 run -e TEST=folderStructure -e VUS=50 -e DURATION=1m multi-user-test.js
npm run view-report
```

### Notes on preserved behavior
- `login` intentionally does **not** use the shared bearer-token params —
  it builds its own headers and payload, same as the original script.
- `equipmentSizes` still ends with `sleep(1)`, preserving the original
  script's pacing between the equipment-sizes check and whatever runs next.
- All endpoint URLs, payloads, and check conditions are unchanged from the
  original `multi-user-test.js` — only the organization changed.