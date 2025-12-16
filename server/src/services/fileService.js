import { Client } from "minio";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import logger from "../utils/logger.js";

// Setup Client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

// Setup Bucket (Hanya sekali jalan)
const ensureBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      logger.info(`✅ Bucket '${BUCKET_NAME}' created with Public Access.`);
    }
  } catch (error) {
    logger.error(`❌ MinIO Setup Error: ${error.message}`);
  }
};
ensureBucket();

export const uploadToMinio = async (file) => {
  try {
    let filename = `${uuidv4()}`;
    let buffer = file.buffer;
    let contentType = file.mimetype;
    let originalName = file.originalname;

    // --- STRATEGI KOMPRESI BARU (WebP + High Effort) ---

    // Cek apakah file adalah gambar
    if (file.mimetype.startsWith("image/")) {
      logger.info(`Compressing image: ${originalName}...`);

      // Proses Sharp
      buffer = await sharp(file.buffer)
        // 1. Resize Cerdas: Max width 1920px (Full HD), tinggi menyesuaikan.
        //    'withoutEnlargement': Jangan perbesar jika gambar asli kecil (agar tidak pecah).
        .resize({ width: 1920, withoutEnlargement: true })

        // 2. Convert ke WebP (The Game Changer)
        .webp({
          quality: 70, // Quality 70 di WebP sangat tajam (setara JPG 90)
          alphaQuality: 80, // Pertahankan transparansi (jika PNG) dengan baik
          effort: 6, // (0-6) Gunakan CPU max untuk kompresi maksimal. Slower but smallest size.
          smartSubsample: true, // Mengurangi noise pada warna
        })
        .toBuffer();

      // Ubah ekstensi dan tipe konten
      filename = `${filename}.webp`;
      contentType = "image/webp";
    } else {
      // Jika bukan gambar (PDF, Zip, Video), gunakan ekstensi asli
      // Catatan: PDF/Zip sulit dikompres server-side tanpa merusak data/text vector.
      // Kita simpan as-is (apa adanya) untuk menjaga integritas file dokumen.
      const ext = path.extname(originalName).toLowerCase();
      filename = `${filename}${ext}`;
    }

    // --- UPLOAD ---

    // Tambahkan Metadata Cache Control agar browser user tidak download ulang terus menerus
    const metaData = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable", // Cache 1 tahun
    };

    await minioClient.putObject(BUCKET_NAME, filename, buffer, buffer.length, metaData);

    const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
    const url = `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${filename}`;

    return {
      filename: originalName,
      storedName: filename,
      url: url,
      mimetype: contentType,
      size: buffer.length,
    };
  } catch (error) {
    logger.error(`MinIO Upload Error: ${error.message}`);
    throw new Error("File upload service failed");
  }
};

export const deleteFromMinio = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    const filename = fileUrl.split("/").pop();
    await minioClient.removeObject(BUCKET_NAME, filename);
  } catch (error) {
    logger.error(`MinIO Delete Error: ${error.message}`);
  }
};
