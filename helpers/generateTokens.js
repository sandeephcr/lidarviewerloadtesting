import {credentialObject , encryptPayload, saveDataToJson} from './helpers.js'
// let excelpath = '../UsersData1.xlsx'
import path from 'path'

let excelpath = path.join(process.cwd(), 'UsersData1.xlsx')
console.log(excelpath)


const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5YmZkZ6suIzOnZ0+n9jU
rzlvW6FwuEQ5pDnLc77thzNOnh2TW8S63SDKZ2DNjykvXpN420GkZszr5+y8BNKB
xnxonGv3nN6130HYqQ3b0IdGrNkF6pvjWT/MCVenimP2stbztCMW5z0QsWei1dic
7CLGtvapQu5nBmJi8RdBhdLCoSxhWQ8XaMuVyAcL/+LWEUIGaXkPddBPMVeQHeFj
U12++HqcA341HO4PqbhKzO/nHKYreRTzfQvAXsNgcLHcaM9ZZHYQVuTsSCLdQSLU
ISQxalZhZRYNCILl4LzmdfnHDHQVQCmUSAfabeYWPK+AkgmpZQ5yU0lTf7iw6DGz
HQIDAQAB
-----END PUBLIC KEY-----
`
let usersData = credentialObject(excelpath);
let encryptedTokens
async function getTokens() {
  // Await all promises to get the actual tokens
   encryptedTokens = Promise.all(
    usersData.map(user => encryptPayload(user, publicKeyPem))
  );
  return encryptedTokens; // now this is an array of resolved tokens, not promises
};

await saveDataToJson(await getTokens(), 'data', 'tokens.json')
await saveDataToJson(usersData, 'data', 'users.json')



