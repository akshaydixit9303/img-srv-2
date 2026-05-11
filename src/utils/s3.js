import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Builds a unique S3 key using a timestamp + UUID prefix.
 * e.g. uploads/2026-05-11T12-00-00_abc123.jpg
 */
export function buildS3Key(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const id = uuidv4().split('-')[0];
  return `uploads/${timestamp}_${id}${ext}`;
}

/**
 * Streams a file buffer to S3 with multipart upload support.
 * Returns the public URL of the uploaded object.
 */
export async function uploadToS3(buffer, key, mimetype) {
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    },
    queueSize: 4,
    partSize: 1024 * 1024 * 5, // 5 MB parts
    leavePartsOnError: false,
  });

  await upload.done();

  const region = process.env.AWS_REGION;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Deletes an object from S3 by its key.
 */
export async function deleteFromS3(key) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
  );
}
