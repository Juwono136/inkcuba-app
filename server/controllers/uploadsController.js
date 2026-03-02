import { minioClient, bucketName } from '../config/minio.js';
import { getAvatarObjectName } from '../services/avatarService.js';
import logger from '../logger/index.js';

const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

/**
 * Stream avatar image from MinIO. Route: GET /api/uploads/avatars/:filename
 */
export async function getAvatar(req, res, next) {
  try {
    const { filename } = req.params;
    if (!filename || !SAFE_FILENAME.test(filename)) {
      return res.status(400).json({ success: false, message: 'Invalid filename.' });
    }

    const objectName = getAvatarObjectName(filename);
    if (!objectName) {
      return res.status(400).json({ success: false, message: 'Invalid avatar key.' });
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType =
      { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[
        ext
      ] || 'application/octet-stream';

    const stream = await minioClient.getObject(bucketName, objectName);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    stream.pipe(res);
  } catch (err) {
    if (err.code === 'NoSuchKey') {
      return res.status(404).json({ success: false, message: 'Avatar not found.' });
    }
    logger.error('Get avatar error', { error: err.message });
    next(err);
  }
}
