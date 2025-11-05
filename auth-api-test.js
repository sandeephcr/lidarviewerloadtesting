import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from 'k6/data';


const tokens = new SharedArray('tokens', function () {
  return JSON.parse(open('./data/tokens.json'));
});

const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json'));
});

const ACCESS_TOKEN = __ENV.ACCESS_TOKEN || tokens[0] 

export default function () {

  const params = {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  // ---- API calls to test -----

  // 1. Folder Structure
  // let res1 = http.get(
  //   "https://testing.lidartechsolutions.com/admin/runsFolderStructure",
  //   params
  // );
  // check(res1, { "Folder structure status 200": (r) => 
  //   {console.log('r.status----------------', r.status)
  //    return r.status === 200 }
  // });

  // 2. Run Points
  const url = "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/ZF_Hesai_Large_0102_22102025_IMG3505/-84.19897920510651/34.21439309100528/50000000/300/1.5";
    
    const res2 = http.get(url, params);

    check(res2, {
      "Points(50000000) status 200": (r) => {
        console.log("r.status-------------", r.status)
        return r.status === 200},
    });

    // if (!isSuccess) {
    //     fail(`❌ Invalid token or bad response: ${res2.status}`);
    //     // This aborts the entire test execution immediately[web:1][web:13].
    // }

  // // 3. Run Points
  // let res3 = http.get(
  //   "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/ZF_Hesai_Large_0102_22102025_IMG3505/-84.19897920510651/34.21439309100528/5000000/75.00/1.00",
  //   params
  // );
  // check(res3, { "Points(5000000) status 200": (r) => r.status === 200 });

  // // 4. Run Points
  // let res4 = http.get(
  //   "https://testing.lidartechsolutions.com/api/get_run_points2/loc/1/ZF_Hesai_Large_0102_22102025_IMG3505/-84.19897920510651/34.21439309100528/10000000/50.00/1.00",
  //   params
  // );
  // check(res4, { "Points(10000000) status 200": (r) => r.status === 200 });

  // // 5. PCD
  // let res5 = http.get(
  //   "https://testing.lidartechsolutions.com/x/loc/ZF_Hesai_Large_0102_22102025_IMG3505/Points/4370539461/6_34_35_0.dat",
  //   params
  // );
  // check(res5, { "Tile .dat status 200": (r) => r.status === 200 });

  // // 6. image
  // let res6 = http.get(
  //   "https://testing.lidartechsolutions.com/x/loc/ZF_Hesai_Large_0102_22102025_IMG3505/Panoramas/stream_00000000/0_1.jpg",
  //   params
  // );
  // check(res6, { "Panorama .jpg status 200": (r) => r.status === 200 });

  sleep(1);
}