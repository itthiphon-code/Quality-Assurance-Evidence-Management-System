import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  minio: {
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    apiPort: Number(process.env.MINIO_API_PORT ?? 9000),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ROOT_USER ?? "qaems_minio",
    secretKey: process.env.MINIO_ROOT_PASSWORD ?? "qaems_minio_password",
    bucket: process.env.MINIO_BUCKET ?? "qaems-evidence",
    presignedUrlExpiresSeconds: Number(process.env.PRESIGNED_URL_EXPIRES_SECONDS ?? 600),
  },
};
