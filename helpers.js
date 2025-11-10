// helpers.js
import XLSX from "xlsx";
import forge from "node-forge";
import fs from "fs";
import path from "path";

// -------------------------
// Read Excel and return credentials
// -------------------------
export const credentialObject = (excelpath) => {
  console.log("\n📘 Starting Excel file processing...");
  const startTime = Date.now();

  console.time("Excel Reading");
  const workbook = XLSX.readFile(excelpath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const users = data.map((row) => ({
    email: row.Username,
    password: row.password,
  }));

  const totalTime = (Date.now() - startTime) / 1000;
  const rate = (users.length / totalTime).toFixed(2);
  console.timeEnd("Excel Reading");

  console.log(`\n=== Excel Processing Summary ===`);
  console.log(`Total users read: ${users.length}`);
  console.log(`Processing time: ${totalTime.toFixed(2)} sec`);
  console.log(`Processing rate: ${rate} users/sec`);
  console.log("=============================\n");

  return users;
};

// -------------------------
// Save data as JSON
// -------------------------
export const saveDataToJson = async (data, folderPath = "./data", fileName = "data.json") => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`💾 Saved: ${filePath}`);
};

// -------------------------
// Encrypt payload with public key
// -------------------------
export const encryptPayload = async (payloadObject, publicKeyPem) => {
  console.time("Token Encryption");
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem.trim());
  const payloadString = JSON.stringify(payloadObject);
  const encryptedBytes = publicKey.encrypt(payloadString, "RSA-OAEP");
  const encryptedBase64 = forge.util.encode64(encryptedBytes);
  console.timeEnd("Token Encryption");
  return encryptedBase64;
};