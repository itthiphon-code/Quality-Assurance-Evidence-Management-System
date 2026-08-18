import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";

// ตัวเชื่อมต่อ MinIO (S3-compatible) — ใช้จัดเก็บไฟล์หลักฐานตั้งแต่ Phase 2
export const s3Client = new S3Client({
  endpoint: `${env.minio.useSSL ? "https" : "http"}://${env.minio.endPoint}:${env.minio.apiPort}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: env.minio.accessKey,
    secretAccessKey: env.minio.secretKey,
  },
  forcePathStyle: true,
});

export const EVIDENCE_BUCKET = env.minio.bucket;

// เรียกครั้งเดียวตอนเซิร์ฟเวอร์เริ่มทำงาน — สร้าง bucket ถ้ายังไม่มี
export async function ensureBucketExists(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: EVIDENCE_BUCKET }));
  } catch {
    await s3Client.send(new CreateBucketCommand({ Bucket: EVIDENCE_BUCKET }));
    console.log(`Created MinIO bucket: ${EVIDENCE_BUCKET}`);
  }
}

export function buildObjectKey(evidenceId: string, originalFilename: string): string {
  const safeName = originalFilename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `evidence/${evidenceId}/${randomUUID()}-${safeName}`;
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: EVIDENCE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({ Bucket: EVIDENCE_BUCKET, Key: key }));
}

export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
  const command = new GetObjectCommand({ Bucket: EVIDENCE_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
