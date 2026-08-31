// AWS S3 / Cloudflare R2 file upload helper
// Configure via env: AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<UploadResult> {
  // Placeholder — wire up @aws-sdk/client-s3 when S3/R2 is configured
  throw new Error('S3 upload not configured. Set AWS_BUCKET env variable.');
}

export async function deleteFromS3(key: string): Promise<void> {
  throw new Error('S3 delete not configured. Set AWS_BUCKET env variable.');
}
