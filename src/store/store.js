window.store = {};
const updateStoreEvent = (type, ...options) =>
	new CustomEvent('updatestore', { bubbles: true, detail: { type, ...options } });

export const setDialogs = dialogs => {
	window.store.dialogs = dialogs;
	document.getElementById('user-dialogs').dispatchEvent(updateStoreEvent('setDialogs'));
};

export const appendDialogs = dialogs => {
	window.store.dialogs = [...window.store.dialogs, ...dialogs];
	document.getElementById('user-dialogs').dispatchEvent(updateStoreEvent('appendDialogs'));
};

export const getDialogs = (offset = 0) => window.store.dialogs.slice(offset);
