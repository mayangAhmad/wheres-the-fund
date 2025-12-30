// server only
import { PinataSDK } from "pinata";

console.log("PINATA_JWT:", process.env.PINATA_JWT ? "Loaded" : "Missing");

// Keep secrets server-side only. Ensure PINATA_JWT is set in your .env.
export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

async function testAuth() { try { const res = await pinata.testAuthentication(); console.log("Pinata Auth Success:", res); } catch (err) { console.error("Pinata Auth Failed:", err); } }
testAuth();
export default pinata;
