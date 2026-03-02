import { minioClient, bucketName } from '../config/minio.js';
import logger from '../logger/index.js';

const AVATAR_PREFIX = 'avatars/';
const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Upload avatar buffer to MinIO. Returns the stored key (filename only, e.g. "userId-1234567890.jpg")
 * so that the full MinIO key is avatars/<returned>.
 * @param {Buffer} buffer
 * @param {string} userId
 * @param {string} mimeType
 * @returns {Promise<string>} key without prefix (e.g. "userId-1234567890.jpg")
 */
export async function uploadAvatarToMinio(buffer, userId, mimeType) {
  const ext = EXT_BY_MIME[mimeType] || 'jpg';
  const filename = `${userId}-${Date.now()}.${ext}`;
  const objectName = AVATAR_PREFIX + filename;

  await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  logger.info('Avatar uploaded to MinIO', { objectName, userId });
  return filename;
}

export function getAvatarObjectName(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  const safe = avatarUrl.replace(/^avatars\//, '').split('/')[0];
  if (!/^[a-zA-Z0-9._-]+$/.test(safe)) return null;
  return AVATAR_PREFIX + safe;
}

/**
 * Delete avatar object from MinIO if it exists. Safe to call with invalid or missing key
 * (no-op). Does not throw; logs errors so the main flow (e.g. profile update) is not blocked.
 * @param {string} avatarUrl - Stored key (filename only, e.g. "userId-123.jpg") or full key
 * @returns {Promise<void>}
 */
export async function deleteAvatarFromMinio(avatarUrl) {
  const objectName = getAvatarObjectName(avatarUrl);
  if (!objectName) return;
  try {
    await minioClient.removeObject(bucketName, objectName);
    logger.info('Avatar removed from MinIO', { objectName });
  } catch (err) {
    if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
      logger.debug('Avatar object already missing in MinIO', { objectName });
      return;
    }
    logger.warn('MinIO delete avatar failed (non-fatal)', { objectName, error: err.message });
  }
}
