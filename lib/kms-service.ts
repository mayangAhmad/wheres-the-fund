// lib/kms-service.ts
import { AwsKmsSigner } from '@nexusmutual/ethers-v6-aws-kms-signer';
import { JsonRpcProvider } from 'ethers';

const AWS_REGION = process.env.AWS_REGION!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const QUORUM_RPC_URL = process.env.QUORUM_RPC_URL!;

export function createKmsSigner(kmsKeyId: string): AwsKmsSigner {
  const provider = new JsonRpcProvider(QUORUM_RPC_URL);
  return new AwsKmsSigner(
    {
      region: AWS_REGION,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      kmsKeyId,
    },
    provider
  );
}

// ✅ canonical address derivation using the signer itself
export async function getAddressFromKms(kmsKeyId: string): Promise<string> {
  const signer = createKmsSigner(kmsKeyId);
  return await signer.getAddress();
}
