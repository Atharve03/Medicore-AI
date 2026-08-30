const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const notificationRepository = require('../../repositories/notification.repository');
const userRepository = require('../../repositories/user.repository');
const { sendEmail } = require('../../utils/mailer');

/**
 * The single entry point any module should use to notify a user — always
 * creates the in-app Notification record, and optionally emails it too.
 * A failed/skipped email never throws or blocks the in-app notification
 * from being created (see utils/mailer.js).
 *
 * Not yet called by Appointment/Billing/Laboratory — wiring those trigger
 * points retroactively into already-completed phases is out of scope for
 * this phase; this is the hook future phases (or a follow-up pass) call.
 */
async function notifyUser(userId, { type, title, message }, { email = false } = {}) {
  const notification = await notificationRepository.create({
    userId,
    type,
    title,
    message,
  });

  if (email) {
    const user = await userRepository.findById(userId);
    if (user && user.email) {
      await sendEmail({ to: user.email, subject: title, text: message });
    }
  }

  return notification.toClientJSON();
}

async function listMine(userId, query) {
  const { page, limit } = parsePagination(query);
  const { items, total, unreadCount } = await notificationRepository.listForUser({
    userId,
    isRead: query.isRead,
    page,
    limit,
  });

  return {
    ...buildPaginatedResult({
      items: items.map((n) => n.toClientJSON()),
      total,
      page,
      limit,
    }),
    unreadCount,
  };
}

async function markRead(id, requestingUser) {
  const notification = await notificationRepository.findById(id);
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }
  if (String(notification.userId) !== String(requestingUser.id)) {
    throw ApiError.forbidden('You may only mark your own notifications as read');
  }

  const updated = await notificationRepository.markRead(id);
  return updated.toClientJSON();
}

module.exports = { notifyUser, listMine, markRead };
