window.store = {};
window.store.mapId = {};
export const updateStoreEvent = (type, options) =>
	new CustomEvent(type, { bubbles: false, cancelable: true, detail: options });

const mapAndIdx = (dialog, idx) => {
	//TODO: отхендлить естественное изменение порядка диалогов
	const {
		dialog_peer: { user_id, channel_id, chat_id },
	} = dialog;
	const id = user_id || channel_id || chat_id;
	dialog.id = id;
	window.store.mapId[id] = idx;

	return dialog;
};

const setChats = (storeString, elem, event) => chats => {
	window.store[storeString] = chats.map(mapAndIdx);

	elem.dispatchEvent(updateStoreEvent(event));
};

export const SET_DIALOGS = 'SET_DIALOGS';
export const setDialogs = dialogs => setChats('dialogs', document.getElementById('user-dialogs'), SET_DIALOGS)(dialogs);

export const SET_ARCHIVES = 'SET_ARCHIVES';
export const setArchives = archives =>
	setChats('archives', document.getElementById('archives'), SET_ARCHIVES)(archives);

const appendChats = (storeString, element, event) => chats => {
	const { length } = window.store[storeString];
	chats = chats.filter(chat => {
		const {
			dialog_peer: { user_id, channel_id, chat_id },
			savedMessages,
		} = chat;
		const id = user_id || channel_id || chat_id;
		console.log('savedMessages', savedMessages);
		return !(mapId(id) || document.getElementById(`dialog_${id}`));
	});
	window.store[storeString] = [...window.store[storeString], ...chats];
	window.store[storeString] = window.store[storeString].map(mapAndIdx);
	element.dispatchEvent(updateStoreEvent(event, { length }));
};

export const APPEND_DIALOGS = 'APPEND_DIALOGS';
export const appendDialogs = dialogs =>
	appendChats('dialogs', document.getElementById('user-dialogs'), APPEND_DIALOGS)(dialogs);

export const APPEND_ARCHIVES = 'APPEND_ARCHIVES';
export const appendArchives = archives =>
	appendChats('archives', document.getElementById('archives'), APPEND_DIALOGS)(archives);

export const SET_USER = 'SET_USER';
export const setUser = user => {
	window.store.user = user;
	document.dispatchEvent(updateStoreEvent(SET_USER));
};

export const getUser = () => {
	return window.store.user;
};

export const updateMap = (id, idx) => {
	window.store.mapId[id] = idx;
};

export const addToUser = (propName, value) => {
	window.store.user = { ...window.store.user, [propName]: value };
	document.dispatchEvent(updateStoreEvent(SET_USER));
};

export const UPDATE_DIALOG = `UPDATE_DIALOG`;
export const updateDialog = dialog => {
	const { id } = dialog;
	window.store.dialogs[mapId(id)] = dialog;
	document.getElementById('user-dialogs').dispatchEvent(updateStoreEvent(UPDATE_DIALOG, { id }));
};

export const UPDATE_DIALOG_PHOTO = `UPDATE_DIALOG_PHOTO`;
export const updateDialogPhoto = (id, photo) => {
	window.store.dialogs[mapId(id)].photo = photo;
	document.getElementById(`dialog_${id}`).dispatchEvent(updateStoreEvent(UPDATE_DIALOG_PHOTO, { id }));
	const topBar = document.querySelector('top-bar');
	if (topBar && topBar.getAttribute('user_id') == id) {
		topBar.dispatchEvent(updateStoreEvent(UPDATE_DIALOG_PHOTO, { id }));
	}
};

export const getDialogs = (offset = 0) => window.store.dialogs.slice(offset);
export const getArchives = (offset = 0) => window.store.archives.slice(offset);

export const getDialog = id => window.store.dialogs[mapId(id)];
export const getMessages = peer => messageId => window.store.messages[peer][messageId];

export const mapId = id => window.store.mapId[id];

export const SET_ACTIVE_PEER = 'SET_ACTIVE_PEER';
export const setActivePeer = peer => {
	window.store.activePeer = peer;
	document.getElementById('right-sidebar').dispatchEvent(updateStoreEvent(SET_ACTIVE_PEER, { peer }));
};

export const getActivePeer = () => {
	return window.store.activePeer;
};
