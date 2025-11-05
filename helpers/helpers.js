import XLSX from 'xlsx';
import forge from 'node-forge';
import fs from 'fs'
import path from 'path'


// Load your Excel file
export const credentialObject = (excelpath) => {
  const workbook = XLSX.readFile(excelpath);
  // Select the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Convert sheet to JSON array
  const data = XLSX.utils.sheet_to_json(sheet);
  // Map JSON rows to objects with username and password
  const users = data.map(row => ({
    email: row.Username,
    password: row.password
  }));
  return users
}

export const saveDataToJson = async (data, folderPath = './data', fileName = 'data.json') => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const encryptPayload = async (payloadObject, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem.trim());
  const payloadString = JSON.stringify(payloadObject);
  const encryptedBytes = publicKey.encrypt(payloadString, 'RSA-OAEP');
  const encryptedBase64 = forge.util.encode64(encryptedBytes);
  return encryptedBase64;
}




