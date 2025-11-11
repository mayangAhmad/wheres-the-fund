// lib/kms-service.ts
import { AwsKmsSigner } from '@nexusmutual/ethers-v6-aws-kms-signer';
import { JsonRpcProvider, TypedDataDomain, TypedDataField } from 'ethers';

const AWS_REGION = process.env.AWS_REGION!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const QUORUM_RPC_URL = process.env.QUORUM_RPC_URL!;

export function createKmsSigner(kmsKeyId: string): AwsKmsSigner {
  const provider = new JsonRpcProvider(QUORUM_RPC_URL);
  const signer = new AwsKmsSigner(
    {
      region: AWS_REGION,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      kmsKeyId,
    },
    provider
  );
  
  return signer;
}

// 🆕 ADD: EIP-712 signing method (if your AwsKmsSigner supports it)
// If the method below doesn't work, we'll use the fallback approach
export async function signTypedDataWithKms(
  kmsKeyId: string,
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  value: Record<string, unknown>
): Promise<string> {
  const signer = createKmsSigner(kmsKeyId);
  
  // Try the EIP-712 signing method
  if (typeof (signer as AwsKmsSigner).signTypedData === 'function') {
    return await (signer as AwsKmsSigner).signTypedData(domain, types, value);
  }
  
  // Fallback: use the standard method
  return await signer.signTypedData(domain, types, value);
}

//canonical address derivation using the signer itself
export async function getAddressFromKms(kmsKeyId: string): Promise<string> {
  const signer = createKmsSigner(kmsKeyId);
  return await signer.getAddress();
}
