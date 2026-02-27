import * as Minio from 'minio';
import config from './index.js';
import logger from '../logger/index.js';

const { minio: minioConfig } = config;
const minioClient = new Minio.Client({
  endPoint: minioConfig.endPoint,
  port: minioConfig.port,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey,
});

const bucketName = minioConfig.bucketName;

export const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (exists) {
      logger.info('MinIO bucket ready', { bucket: bucketName });
    } else {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      logger.info('MinIO bucket created', { bucket: bucketName });
    }
  } catch (error) {
    logger.error('MinIO initialization error', { error: error.message });
    // Server continues without MinIO so other features can run
  }
};

export { minioClient, bucketName };