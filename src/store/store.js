window.store = {};
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

export const SET_DIALOGS = 'SET_DIALOGS';
export const setDialogs = dialogs => {
	window.store.mapId = {};
	window.store.dialogs = dialogs.map(mapAndIdx);

	document.getElementById('user-dialogs').dispatchEvent(updateStoreEvent(SET_DIALOGS));
};

export const APPEND_DIALOGS = 'APPEND_DIALOGS';
export const appendDialogs = dialogs => {
	const { length } = window.store.dialogs;
	dialogs = dialogs.map(mapAndIdx);
	window.store.dialogs = [...window.store.dialogs, ...dialogs];
	window.store.dialogs = window.store.dialogs.map(mapAndIdx);
	document.getElementById('user-dialogs').dispatchEvent(updateStoreEvent(APPEND_DIALOGS, { length }));
};

export const SET_USER = 'SET_USER';
export const setUser = user => {
	window.store.user = user;
	document.dispatchEvent(updateStoreEvent(SET_USER));
};

export const getUser = () => {
	return window.store.user;
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
	topBar && topBar.dispatchEvent(updateStoreEvent(UPDATE_DIALOG_PHOTO, { id }));
};

export const getDialogs = (offset = 0) => window.store.dialogs.slice(offset);

export const mapId = id => window.store.mapId[id];
