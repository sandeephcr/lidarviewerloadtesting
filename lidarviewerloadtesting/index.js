import forge from 'node-forge';


const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5YmZkZ6suIzOnZ0+n9jU
rzlvW6FwuEQ5pDnLc77thzNOnh2TW8S63SDKZ2DNjykvXpN420GkZszr5+y8BNKB
xnxonGv3nN6130HYqQ3b0IdGrNkF6pvjWT/MCVenimP2stbztCMW5z0QsWei1dic
7CLGtvapQu5nBmJi8RdBhdLCoSxhWQ8XaMuVyAcL/+LWEUIGaXkPddBPMVeQHeFj
U12++HqcA341HO4PqbhKzO/nHKYreRTzfQvAXsNgcLHcaM9ZZHYQVuTsSCLdQSLU
ISQxalZhZRYNCILl4LzmdfnHDHQVQCmUSAfabeYWPK+AkgmpZQ5yU0lTf7iw6DGz
HQIDAQAB
-----END PUBLIC KEY-----
`;

// const user = {
//   email: "admin@hcrobo.com",
//   password: "Cnsw-123"
// };

export function encryptPayload(payloadObject) {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem.trim());
  const payloadString = JSON.stringify(payloadObject);
  const encryptedBytes = publicKey.encrypt(payloadString, 'RSA-OAEP');
  const encryptedBase64 = forge.util.encode64(encryptedBytes);
  return encryptedBase64;
}

