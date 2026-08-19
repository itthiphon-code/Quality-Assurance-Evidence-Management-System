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
import type { Readable } from "node:stream";
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

export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = env.minio.presignedUrlExpiresSeconds,
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: EVIDENCE_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export interface StoredObject {
  body: Readable;
  contentType: string;
  contentLength?: number;
}

// อ่านไฟล์จาก MinIO เป็นสตรีมเพื่อส่งต่อให้ผู้ใช้ผ่าน backend
// ไม่ใช้ presigned URL ให้เบราว์เซอร์ไปดึงเอง เพราะ URL จะถูกเซ็นด้วยที่อยู่ภายใน Docker
// (เช่น http://minio:9000) ซึ่งเครื่องผู้ใช้ resolve ไม่ได้ — และการส่งผ่าน backend
// ยังทำให้ทุกการเปิดไฟล์ผ่านการตรวจสิทธิ์และถูกบันทึก audit log จริง ๆ ทุกครั้ง
export async function getObjectStream(key: string): Promise<StoredObject> {
  const res = await s3Client.send(new GetObjectCommand({ Bucket: EVIDENCE_BUCKET, Key: key }));
  return {
    body: res.Body as Readable,
    contentType: res.ContentType ?? "application/octet-stream",
    contentLength: res.ContentLength,
  };
}
