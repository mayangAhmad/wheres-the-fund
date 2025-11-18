import { AwsKmsSigner } from '@nexusmutual/ethers-v6-aws-kms-signer';
import { JsonRpcProvider, TypedDataDomain, TypedDataField } from 'ethers';

const AWS_REGION = process.env.AWS_REGION!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const QUORUM_RPC_URL = process.env.QUORUM_RPC_URL!;

// Helper to create signer (With Provider)
export function createKmsSigner(kmsKeyId: string, provider?: JsonRpcProvider): AwsKmsSigner {
  // Fallback to default provider if none passed
  const rpcProvider = provider || new JsonRpcProvider(QUORUM_RPC_URL);
  
  return new AwsKmsSigner(
    {
      region: AWS_REGION,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      kmsKeyId,
    },
    rpcProvider // ✅ Always pass a valid provider to satisfy TypeScript
  );
}

export async function signTypedDataWithKms(
  kmsKeyId: string,
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  value: Record<string, unknown>
): Promise<string> {
  const signer = createKmsSigner(kmsKeyId);
  return await signer.signTypedData(domain, types, value);
}

// ✅ FIX: Use the helper function. 
// The JsonRpcProvider is "lazy" (no network call on creation), so this is still fast.
export async function getAddressFromKms(kmsKeyId: string): Promise<string> {
  const signer = createKmsSigner(kmsKeyId);
  return await signer.getAddress();
}