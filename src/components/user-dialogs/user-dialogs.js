import {
	getDialogs,
	SET_DIALOGS,
	APPEND_DIALOGS,
	setActivePeer,
	getUser,
	getDialog,
	updateDialogUnread,
	updateDialogShort,
	updateDialogDate,
	updateDialogOnlineStatus,
	appendDialogs,
	appendArchives,
} from '../../store/store';
import {
	htmlToElement,
	startLoading,
	stopLoading,
	createDiv,
	getNotificationsModeBoolByPeer,
	hide,
	onScrollBottom,
} from '../../helpers/index';
import chatMain from '../../pages/chat-main/index';
import './user-dialogs.scss';
import { telegramApi } from '../../App';
import { outSvg } from './dialog/dialog.html';

export const renderDialog = (component, archived = false) => dialog => {
	const { id, pinned } = dialog;
	const { id: userId } = getUser();
	if (id == userId) {
		dialog.savedMessages = true;
		dialog.title = 'Saved Messages';
	}

	const elem = htmlToElement(
		`<my-dialog anim="ripple" class="dialog" id="dialog_${id}" archived="${archived}"></my-dialog>`
	);
	elem.addEventListener('click', () => loadDialog(component)(elem)(id));

	if (pinned) {
		component.pinned.appendChild(elem);
		component.pinned.classList.add('pinned_exist');
	} else {
		component.normal.appendChild(elem);
	}
};

export const loadDialog = component => elem => async (dialogId, messageId) => {
	const dialog = getDialog(dialogId);
	let { id, dialog_peer: peer, photo: avatar } = dialog;
	if (component.prevActive) {
		if (component.prevId === id) {
			return;
		} else {
			component.prevActive.classList.toggle('dialog_active');
		}
	}
	telegramApi.readPeerHistory(id).then(() => {
		updateDialogUnread(dialogId, 0);
	});
	component.prevActive = elem;
	component.prevId = id;
	const rightSidebar = document.querySelector('.right-sidebar');
	rightSidebar.setAttribute('peer_id', id);
	elem.classList.toggle('dialog_active');
	const right = document.getElementById('right');
	startLoading(right);
	const fullPeer = await telegramApi.getFullPeer(id);
	setActivePeer({ fullPeer: { ...fullPeer, avatar, id }, ...peer });
	right.innerHTML = `<top-bar user_id="${id}"></top-bar><chat-main start-message='${messageId}' peer-id="${id}"></chat-main>`;
};

export default class UserDialogs extends HTMLElement {
	render() {
		this.id = 'user-dialogs';
		this.renderDialog = renderDialog(this);
		this.addEventListener(SET_DIALOGS, this.setListener, { capture: true });
		this.addEventListener(APPEND_DIALOGS, this.updateListener, { capture: true });
		this.pinned = createDiv('pinned');
		this.pinned.id = 'pinned_dialogs';
		this.normal = createDiv('normal');
		this.normal.id = 'normal_dialogs';
		this.appendChild(this.pinned);
		this.appendChild(this.normal);
		telegramApi.subscribeToUpdates('dialogs', data => {
			const { _: type } = data;
			switch (type) {
				case 'newMessage':
					this.updateMessage(data);
					break;
				case 'userStatus':
					this.updateStatus(data);
					break;
			}
		});

		onScrollBottom(this, this.scrollHandler);
	}

	updateMessage = data => {
		const {
			to_id,
			from_id,
			message,
			date,
			message_info: { out },
		} = data;
		let id = from_id;
		const { id: myId } = getUser();
		if (to_id && to_id !== myId) {
			id = to_id;
		}
		const dialog = getDialog(id);
		if (!dialog) {
			return;
		}
		const { archived, unreadCount, pinned } = dialog;
		if (archived) {
			return;
		}
		const time = telegramApi._convertDate(date);
		const dialogElem = document.getElementById(`dialog_${id}`);
		const info = dialogElem.querySelector('.dialog__info');
		if (out) {
			if (!info.querySelector('.dialog__out')) {
				if (!this.out) {
					this.out = htmlToElement(`<div class="dialog__out">${outSvg}</div>`);
				}
				info.querySelector('.dialog__time').classList.remove('full', true);
				info.prepend(this.out);
			}
		} else if (to_id !== from_id) {
			const out = info.querySelector('.dialog__out');
			const time = info.querySelector('.dialog__time');
			time.classList.add('full');
			if (out) {
				out.remove();
			}
			updateDialogUnread(id, Number(unreadCount) + 1);
		}

		dialogElem.querySelector('.dialog__short-msg').innerHTML = message;
		dialogElem.querySelector('.dialog__time').innerHTML = time;
		updateDialogShort(id, message);
		updateDialogDate(id, date);
		if (!pinned) {
			this.normal.prepend(dialogElem);
		}
	};

	scrollHandler = event => {
		if (this.loading) {
			return;
		}
		const load = ({ dialog_items: data, archived_items }) => {
			appendDialogs(data);
			appendArchives(archived_items);
			window.updateRipple();
		};

		this.loading = true;
		telegramApi
			.getDialogsParsed(100)
			.then(load)
			.then(() => {
				this.loading = false;
			});
	};

	updateStatus = data => {
		const { user_id, online } = data;
		updateDialogOnlineStatus(user_id, online);
	};

	setListener = event => {
		getDialogs().forEach(this.renderDialog);
	};

	updateListener = event => {
		const dialogs = getDialogs(event.detail.length);
		dialogs.forEach(this.renderDialog);
	};

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
