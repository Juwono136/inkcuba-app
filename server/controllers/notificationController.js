import Notification from '../models/Notification.js';
import logger from '../logger/index.js';

/** GET /api/notifications - list for current user with pagination and optional search */
export async function listNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const unreadOnly = req.query.unread === 'true';

    const filter = { user: userId };
    if (unreadOnly) filter.read = false;
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { body: new RegExp(q, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.json({
      success: true,
      data: items.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.read,
        relatedId: n.relatedId,
        metadata: n.metadata || {},
        createdAt: n.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      unreadCount,
    });
  } catch (err) {
    logger.error('List notifications error', { error: err.message });
    next(err);
  }
}

/** GET /api/notifications/latest - get 5 latest for navbar */
export async function getLatest(req, res, next) {
  try {
    const userId = req.user.id;
    const items = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.json({
      success: true,
      data: items.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        body: n.body,
        read: n.read,
        relatedId: n.relatedId,
        metadata: n.metadata || {},
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (err) {
    logger.error('Get latest notifications error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/notifications/:id/read - mark one as read */
export async function markRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, notification: { id: updated._id, read: updated.read } });
  } catch (err) {
    logger.error('Mark read error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/notifications/read-all - mark all as read for current user */
export async function markAllRead(req, res, next) {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    logger.error('Mark all read error', { error: err.message });
    next(err);
  }
}
