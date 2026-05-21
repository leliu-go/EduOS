import { createAliyunOssStorageProviderFromEnv } from "../../lib/storage/aliyun-oss-provider";

async function main() {
  const provider = createAliyunOssStorageProviderFromEnv(process.env);
  const objectKey = "test/eduos-smoke.txt";
  const stored = await provider.putObject({
    tenantId: "test",
    resourceId: "eduos-smoke",
    fileName: "eduos-smoke.txt",
    contentType: "text/plain; charset=utf-8",
    objectKey,
    body: Buffer.from(`EduOS OSS smoke ${new Date().toISOString()}\n`, "utf8"),
  });
  const signed = await provider.createSignedDownloadUrl({
    objectKey: stored.objectKey,
    expiresInSeconds: 60,
  });
  const response = await fetch(signed.url, {
    method: "HEAD",
  });

  if (!response.ok) {
    throw new Error(`Signed URL HEAD failed with status ${response.status}`);
  }

  console.log(`Uploaded object: ${stored.objectKey}`);
  console.log(`Bucket: ${stored.bucket}`);
  console.log(`Signed URL HEAD status: ${response.status}`);
  console.log(`Signed URL expires at: ${signed.expiresAt.toISOString()}`);
  console.log("Secret values and the signed URL were not printed.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`OSS smoke test failed: ${message}`);
  process.exit(1);
});
