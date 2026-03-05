import Notification from '../models/Notification.js';
import logger from '../logger/index.js';

/**
 * Create notifications for multiple users (e.g. when workspace is assigned).
 * @param {string[]} userIds - Array of user ObjectIds or strings
 * @param {string} type - Notification type (workspace_assigned, submission_reviewed, etc.)
 * @param {string} title - Short title
 * @param {string} [body] - Optional body text
 * @param {string} [relatedId] - Optional related entity id for navigation
 * @param {object} [metadata] - Optional { workspaceId, cardId, submissionId }
 */
export async function createForUsers(userIds, type, title, body = '', relatedId = null, metadata = {}) {
  if (!Array.isArray(userIds) || userIds.length === 0) return;
  const unique = [...new Set(userIds.map((id) => String(id)).filter(Boolean))];
  if (unique.length === 0) return;
  try {
    const docs = unique.map((user) => ({
      user,
      type,
      title,
      body: typeof body === 'string' ? body.slice(0, 1000) : '',
      relatedId: relatedId || null,
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
    }));
    await Notification.insertMany(docs);
    logger.info('Notifications created', { count: docs.length, type });
  } catch (err) {
    logger.error('createForUsers error', { error: err.message });
    throw err;
  }
}
