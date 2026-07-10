import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../config/s3";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import * as fs from "fs";
import * as path from "path";

export const s3Service = {
  /**
   * Upload a local file to S3.
   * Returns the S3 key (path within the bucket).
   */
  async uploadFile(
    localPath: string,
    originalName: string,
    mimetype: string,
    userId: string
  ): Promise<string> {
    const ext = path.extname(originalName);
    const key = `uploads/${userId}/${Date.now()}${ext}`;
    const fileBuffer = fs.readFileSync(localPath);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
      })
    );

    logger.info(`Uploaded to S3: ${key}`);

    // Clean up local file after upload
    try { fs.unlinkSync(localPath); } catch {}

    return key;
  },

  /** Generate a presigned GET URL (1-hour expiry) */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  /** Delete an object from S3 */
  async deleteFile(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
      })
    );

    logger.info(`Deleted from S3: ${key}`);
  },

  /** Public URL (for public buckets / CloudFront CDN) */
  getPublicUrl(key: string): string {
    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  },
};
