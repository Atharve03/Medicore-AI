const { Notification } = require('../models/notification.model');

const notificationRepository = {
  create(data) {
    return Notification.create(data);
  },

  findById(id) {
    return Notification.findById(id);
  },

  markRead(id) {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  },

  async listForUser({ userId, isRead, page = 1, limit = 20 }) {
    const filter = { userId };
    if (typeof isRead === 'boolean') filter.isRead = isRead;

    const skip = (page - 1) * limit;
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);
    return { items, total, page, limit, unreadCount };
  },
};

module.exports = notificationRepository;
