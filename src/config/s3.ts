import { S3Client } from '@aws-sdk/client-s3';
import env from './env';

const s3 = new S3Client({
  forcePathStyle: true,
  region: env.s3.region,
  endpoint: env.s3.uploadFileUrl,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
});

export default s3;
