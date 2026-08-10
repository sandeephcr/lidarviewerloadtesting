// -------------------------
// All LidarViewer endpoints in one place
// Static endpoints are plain strings.
// Endpoints that depend on per-VU data (coordinates, etc.) are functions.
// -------------------------

const BASE_URL = "https://testing.lidartechsolutions.com";

export const ENDPOINTS = {

  folderStructure:
    `${BASE_URL}/admin/runsFolderStructure?folderId=68f9f52e8d7e694d6c15d8c4`,

  pointsLow:
    `${BASE_URL}/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.50`,

  pointsMedium:
    `${BASE_URL}/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.25`,

  pointsHigh:
    `${BASE_URL}/api/get_run_points2/loc/1/Test-Oct30-3/-82.1599066812478/26.97407908939806/5000000/50.00/1.00`,

  pcdDat:
    `${BASE_URL}/x/loc/Test-Oct30-3/Points/5455819325/6_20_5_0.dat`,

  panorama:
    `${BASE_URL}/x/loc/Test-Oct30-3/Panoramas/stream_00000055/0_1.jpg`,

  measurementsPost:
    `${BASE_URL}/api/measurements/loc/1/Test-Oct30-3`,

  filterRunsByLatLng:
    `${BASE_URL}/api/filter_runs/lat_lng?lat=34.12710790205184&lng=-84.13815507646589&thresholdDistance=20`,

  equipmentSizes:
    `${BASE_URL}/api/loc/0/equipment_sizes/`,

  registerUser:
    `${BASE_URL}/admin/register_user`,

  login:
    `${BASE_URL}/api/login`,

  // Dynamic: depends on a coordinate object { longitude, latitude }
  multiLocationPoints: (coord) =>
    `${BASE_URL}/api/get_run_points2/loc/1/Monday_01-12-25/${coord.longitude}/${coord.latitude}/5000000/50.00/1.25`,
};
