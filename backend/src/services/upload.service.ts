import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT, // Required for Cloudflare R2
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

// Secure Upload URL (Presigned) - For PDF / MP4 Uploads directly to S3
export const generateUploadUrl = async (fileName: string, contentType: string) => {
  const bucket = process.env.AWS_S3_BUCKET || 'cestrix-bucket';
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: `resources/${Date.now()}_${fileName}`,
    ContentType: contentType,
  });
  
  // URL expires in 15 minutes
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
  return { uploadUrl, fileKey: command.input.Key };
};

// Secure Video Streaming / View URL (HLS / CloudFront integration points here)
export const generateViewUrl = async (fileKey: string) => {
  // If using CloudFront, you'd generate a CloudFront signed URL here.
  // For basic secure S3 access:
  const bucket = process.env.AWS_S3_BUCKET || 'cestrix-bucket';
  const command = new GetObjectCommand({ Bucket: bucket, Key: fileKey });
  return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour access
};
