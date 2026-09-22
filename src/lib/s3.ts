import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { config } from '../config/index.js';

export const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  forcePathStyle: Boolean(config.s3.endpoint),
  ...(config.s3.accessKeyId && config.s3.secretAccessKey
    ? { credentials: { accessKeyId: config.s3.accessKeyId, secretAccessKey: config.s3.secretAccessKey } }
    : {}),
});

export interface UploadObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export const uploadObject = async ({ key, body, contentType }: UploadObjectInput): Promise<string> => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  const endpoint = config.s3.endpoint?.replace(/\/$/, '');
  return endpoint
    ? `${endpoint}/${config.s3.bucket}/${key}`
    : `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;
};
