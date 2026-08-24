import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

const hasValidR2Credentials =
  env.R2.ACCOUNT_ID &&
  env.R2.ACCESS_KEY_ID &&
  env.R2.SECRET_ACCESS_KEY &&
  env.R2.ACCOUNT_ID !== 'sample_r2_account_id';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: hasValidR2Credentials
    ? `https://${env.R2.ACCOUNT_ID}.r2.cloudflarestorage.com`
    : 'https://r2-endpoint-placeholder.com',
  credentials: {
    accessKeyId: env.R2.ACCESS_KEY_ID || 'dummy',
    secretAccessKey: env.R2.SECRET_ACCESS_KEY || 'dummy',
  },
});

export const IS_R2_CONFIGURED = Boolean(hasValidR2Credentials);
