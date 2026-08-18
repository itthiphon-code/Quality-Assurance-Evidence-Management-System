import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env";

// ตัวเชื่อมต่อ MinIO (S3-compatible) — จะถูกใช้งานจริงตั้งแต่ Phase 2
// (อัปโหลดไฟล์หลักฐาน) เตรียมไว้ล่วงหน้าในสคาฟโฟลด์ Phase 1
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
