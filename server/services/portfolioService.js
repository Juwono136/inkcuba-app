import { minioClient, bucketName } from '../config/minio.js';
import logger from '../logger/index.js';

const PORTFOLIO_PREFIX = 'portfolios/';

/**
 * Upload a portfolio file to MinIO under portfolios/{submissionId}/{filename}.
 * @param {Buffer} buffer
 * @param {string} submissionId
 * @param {string} filename - e.g. screenshot-1.jpg, poster.jpg, report.pdf
 * @param {string} mimeType
 * @returns {Promise<string>} key (portfolios/{submissionId}/{filename})
 */
export async function uploadPortfolioFile(buffer, submissionId, filename, mimeType) {
  const safeId = String(submissionId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const objectName = `${PORTFOLIO_PREFIX}${safeId}/${safeName}`;

  await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  logger.info('Portfolio file uploaded to MinIO', { objectName });
  return objectName;
}

/**
 * Get a key for a screenshot by index (0-based). Used when uploading.
 */
export function screenshotKey(submissionId, index) {
  const safeId = String(submissionId).replace(/[^a-zA-Z0-9_-]/g, '');
  return `${PORTFOLIO_PREFIX}${safeId}/screenshot-${index}.jpg`;
}

/**
 * Delete a single object from MinIO. Safe to call with invalid key (no-op).
 */
export async function deletePortfolioObject(key) {
  if (!key || typeof key !== 'string') return;
  const trimmed = key.trim();
  if (!trimmed.startsWith(PORTFOLIO_PREFIX)) return;
  try {
    await minioClient.removeObject(bucketName, trimmed);
    logger.info('Portfolio object removed from MinIO', { key: trimmed });
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'NotFound') return;
    logger.warn('MinIO delete portfolio object failed', { key: trimmed, error: err.message });
  }
}
