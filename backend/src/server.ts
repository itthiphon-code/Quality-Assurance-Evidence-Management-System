import { app } from "./app";
import { env } from "./config/env";
import { ensureBucketExists } from "./storage/s3Client";

async function main() {
  await ensureBucketExists();
  app.listen(env.port, () => {
    console.log(`QA-EMS backend listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
