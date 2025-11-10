import fs from "fs/promises";

const baseUrl = "https://testing.lidartechsolutions.com/admin/register_user/unblock-user"; // base endpoint
const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGhjcm9iby5jb20iLCJzaXRlSWQiOjEsInNlc3Npb25WZXJzaW9uIjoxLCJpYXQiOjE3NjIzNTM2NTAsImV4cCI6MTc2MjQ0MDA1MH0.QMFI8YJ7jRMA9zaNteMx1Kfqj_hDHske-yQ8PuaBw_w"; // your Bearer token
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// Read emails from JSON file (array of objects with "email")
const emailData = JSON.parse(await fs.readFile(`../data/users.json`, 'utf-8')); 

for (const obj of emailData) {
  const email = obj.email;
  const url = `${baseUrl}/${encodeURIComponent(email)}`;

  
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "Accept": "application/json"
      }
    });

    const data = await res.json();
    console.log(`✅ Response for ${email}:`, data);

  
}
