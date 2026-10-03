import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3Client: S3Client;

export const getPresignedUrl = async (req: Request, res: Response) => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    });
  }
  try {
    const { filename, contentType } = req.body;
    
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and contentType are required' });
    }
    
    const key = `uploads/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: key,
      ContentType: contentType,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // The public URL can be constructed if there is a custom domain for R2.
    // For now, return the R2 public domain or the R2 endpoint + bucket + key
    const publicUrl = process.env.R2_PUBLIC_DOMAIN 
      ? `${process.env.R2_PUBLIC_DOMAIN}/${key}`
      : `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;
      
    return res.status(200).json({
      presignedUrl: url,
      publicUrl,
      key
    });
  } catch (error) {
    console.error('Error generating presigned url:', error);
    return res.status(500).json({ error: 'Failed to generate presigned url' });
  }
};
