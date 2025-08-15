// Minimal in-memory session store for slots persistence. In prod, replace with Redis.

const store = new Map();

const saveSlots = (sessionId, slots) => {
  if (!store.has(sessionId)) store.set(sessionId, {});
  const current = store.get(sessionId);
  store.set(sessionId, Object.assign({}, current, slots));
};

const getSlots = (sessionId) => {
  return store.get(sessionId) || {};
};

module.exports = { saveSlots, getSlots };
