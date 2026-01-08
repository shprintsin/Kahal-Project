import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const R2_CONFIG = {
    endpoint: process.env.R2_ENDPOINT_URL || "",
    accessKeyId: process.env.R2_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
    bucket: "kahal",
    publicUrl: process.env.R2_BASE_URL || ""
};

export const s3 = new S3Client({
    region: "auto",
    endpoint: R2_CONFIG.endpoint,
    credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
    },
});

export async function uploadToR2(file: File, key: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    await s3.send(command);

    return `${R2_CONFIG.publicUrl}/${key}`;
}
