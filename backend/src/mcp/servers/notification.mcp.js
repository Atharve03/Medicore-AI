const notificationRepository = require('../../repositories/notification.repository');
const notificationService = require('../../modules/notification/notification.service');

module.exports = {
  name: 'notification',
  description: "The calling user's own notifications; can also notify the caller themselves.",
  tools: {
    listUnreadForCaller: {
      description: "The calling user's unread notifications (never another user's).",
      async handler({ limit = 10 }, { requestingUser }) {
        const { items } = await notificationRepository.listForUser({
          userId: requestingUser.id,
          isRead: false,
          page: 1,
          limit,
        });
        return items.map((n) => n.toClientJSON());
      },
    },

    /**
     * Deliberately scoped to notifying only the requesting user themselves
     * (e.g. "your AI-generated discharge summary is ready") — this tool
     * has no way to target any other userId, so the AI path can never be
     * used to spam or misdirect notifications to someone else.
     */
    notifySelf: {
      description: 'Send an in-app notification to the calling user only.',
      async handler({ title, message }, { requestingUser }) {
        return notificationService.notifyUser(
          requestingUser.id,
          { type: 'system', title, message },
          { email: false }
        );
      },
    },
  },
};
