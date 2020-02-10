import { peerToId } from "../helpers";

window.store = new Store();

function Store() {
	this.mapId = {};
}

const addPeerStore = peerId => {
	return window.store[peerId] = {
		messages: {},
		links: {},
		photo: {},
		document: {},
		geo: {},
		contact: {},
		invoice: {},
		poll: {},
		webpage: {},
		unsupported: {},
	};
};

export const updateStoreEvent = (type, options) =>
	new CustomEvent(type, { bubbles: false, cancelable: true, detail: options });

const mapAndIdx = (dialog, idx) => {
	//TODO: отхендлить естественное изменение порядка диалогов
	const {
		dialog_peer: { user_id, channel_id, chat_id },
		archived,
	} = dialog;
	const id = user_id || channel_id || chat_id;
	dialog.id = id;
	window.store.mapId[id] = { idx, archived };

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
		} = chat;
		const id = user_id || channel_id || chat_id;
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
	const dialog = getDialog(id);
	dialog.photo = photo;
	document.getElementById(`dialog_${id}`).dispatchEvent(updateStoreEvent(UPDATE_DIALOG_PHOTO, { id }));
	const topBar = document.querySelector('top-bar');
	if (topBar && topBar.getAttribute('user_id') == id) {
		topBar.dispatchEvent(updateStoreEvent(UPDATE_DIALOG_PHOTO, { id }));
	}
};

export const UPDATE_DIALOG_UNREAD = `UPDATE_DIALOG_UNREAD`;
export const updateDialogUnread = (id, count) => {
	const dialog = getDialog(id);
	dialog.unread_count = count;
	document.getElementById(`dialog_${id}`).dispatchEvent(updateStoreEvent(UPDATE_DIALOG_UNREAD, { id }));
};

export const UPDATE_DIALOG_STATUS = `UPDATE_DIALOG_STATUS`;
export const updateDialogStatus = (id, status) => {
	const dialog = getDialog(id);
	dialog.onlineStatus = status;
	document.getElementById(`dialog_${id}`).dispatchEvent(updateStoreEvent(UPDATE_DIALOG_STATUS, { id }));
	const topBar = document.querySelector('top-bar');
	if (topBar && topBar.getAttribute('user_id') == id) {
		topBar.dispatchEvent(updateStoreEvent(UPDATE_DIALOG_STATUS, { id }));
	}
};

export const getDialogs = (offset = 0) => window.store.dialogs.slice(offset);

export const getArchives = (offset = 0) => window.store.archives.slice(offset);

export const getDialog = id => {
	const { idx, archived } = mapId(id);
	if (archived) {
		return window.store.archives[idx];
	} else {
		return window.store.dialogs[idx];
	}
};

export const getByPeerId = peerId => ({
	getMessage: getMessage(peerId),
	getContent: getContent(peerId),
	getPhoto: getPhoto(peerId),
	getDocument: getDocument(peerId),
	getContact: getContact(peerId),
});

export const getAllContent = peerId => type => {
	return window.store[peerId][type];
};

export const getContent = peerId => type => id => {
	return getAllContent(peerId)(type)[id] || {};
};

export const getAllMessages = peerId => {
	return getAllContent(peerId)('messages');
};

export const getMessage = peerId => messageId => {
	return getContent(peerId)('messages')(messageId);
};

export const getPhoto = peerId => photoId => {
	return getContent(peerId)('photo')(photoId);
};

export const getDocument = peerId => documentId => {
	return getContent(peerId)('document')(documentId);
};

export const getContact = peerId => contactId => {
	return getContent(peerId)('contact')(contactId);
};

export const putMessage = peerId => messageId => messageContent => {
	const peerStore = window.store[peerId] || addPeerStore(peerId);
	peerStore.messages[messageId] = messageContent;
	if (messageContent.media) {
		const mediaType = mapDocumentType(messageContent.media._);
		putDocument(peerId)(mediaType)(messageContent.media);
	}
};

export const putDocumentByPeerId = peerId => {
	return putDocument(peerId);
};

export const putDocument = peerId => type => content => {
	const peerStore = window.store[peerId] || addPeerStore(peerId);
	const storeType = mapDocumentType(type);
	const { id: documentId } = content;
	peerStore[storeType][documentId] = content;
};

const mapDocumentType = type => {
	switch (type) {
		case 'messageMediaPhoto':
		case 'photo':
			return `photo`;
		case 'messageMediaDocument':
		case 'document':
			return `document`;
		case 'messageMediaGeo':
		case 'geo':
			return `geo`;
		case 'messageMediaGeoLive':
		case 'geoLive':
			return `geoLive`;
		case 'messageMediaContact':
		case 'contact':
			return `contact`;
		case 'messageMediaGame':
		case 'game':
			return `game`;
		case 'messageMediaInvoice':
		case 'invoice':
			return `invoice`;
		case 'messageMediaPoll':
		case 'poll':
			return `poll`;
		case 'messageMediaWebPage':
		case 'webpage':
			return 'webpage';
		default:
			return `unsupported`;
	}
};

export const getActivePeerId = () => peerToId(getActivePeer());

export const mapId = id => window.store.mapId[id];

export const SET_ACTIVE_PEER = 'SET_ACTIVE_PEER';
export const setActivePeer = peer => {
	window.store.activePeer = peer;
	const rightSidebar = document.getElementById('right-sidebar');
	if (rightSidebar)
		rightSidebar.dispatchEvent(updateStoreEvent(SET_ACTIVE_PEER, { peer }));
};

export const getActivePeer = () => {
	return window.store.activePeer;
};
