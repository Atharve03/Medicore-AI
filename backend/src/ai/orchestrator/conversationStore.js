const env = require('../../config/env');

const conversations = new Map();

function get(userId) {
  return conversations.get(String(userId)) || [];
}

function append(userId, ...messages) {
  const history = [...get(userId), ...messages].slice(-env.aiHistoryLimit);
  conversations.set(String(userId), history);
  return history;
}

function clear(userId) {
  conversations.delete(String(userId));
}

module.exports = { get, append, clear };
