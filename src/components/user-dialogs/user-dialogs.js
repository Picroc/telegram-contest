import {
	getDialogs,
	SET_DIALOGS,
	APPEND_DIALOGS,
	setActivePeer,
	getUser,
	getDialog,
	setActivePeerMedia,
	updateDialog,
} from '../../store/store';
import {
	htmlToElement,
	startLoading,
	stopLoading,
	createDiv,
	getNotificationsModeBoolByPeer,
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
	elem.addEventListener('click', () => loadDialog(component, elem, dialog));

	if (pinned) {
		component.pinned.appendChild(elem);
		component.pinned.classList.add('pinned_exist');
	} else {
		component.normal.appendChild(elem);
	}
};

export const loadDialog = (component, elem, dialog) => {
	const { id, dialog_peer: peer } = dialog;
	if (component.prevActive) {
		if (component.prevId === id) {
			return;
		} else {
			component.prevActive.classList.toggle('dialog_active');
		}
	}
	component.prevActive = elem;
	component.prevId = id;

	elem.classList.toggle('dialog_active');
	const right = document.getElementById('right');
	setActivePeer(peer);
	startLoading(right);
	const rightSidebar = document.getElementById('right-sidebar');
	telegramApi.getFullPeer(id).then(fullPeer => {
		console.log('fullPeer', fullPeer);
		telegramApi.getPeerPhoto(id).then(dialogPhoto => {
			setActivePeer({ ...fullPeer, avatar: dialogPhoto, id });
			telegramApi.getPeerPhotos(id, 0, 20).then(media => {
				console.log('media', media);
				setActivePeerMedia(media);
				rightSidebar.loadPeerSidebar(id);
			});
		});
	});
	right.innerHTML = `<top-bar user_id="${id}"></top-bar><chat-main peer-id="${id}"></chat-main>`;
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
		telegramApi.subscribeToUpdates('messages', data => console.log('data', data));
		telegramApi.subscribeToUpdates('dialogs', data => {
			const { to_peer, from_peer, message, date } = data;
			const time = telegramApi._convertDate(date);
			let { id } = to_peer;
			const dialog = document.getElementById(`dialog_${id}`);
			if (to_peer._ === 'user' && from_peer._ === 'user' && !from_peer.pFlags.self) {
				id = from_peer.id;
			}
			if (from_peer.id === getUser().id && from_peer.id !== to_peer.id) {
				const info = dialog.querySelector('.dialog__info');
				if (!info.querySelector('.dialog__out')) {
					if (!this.out) {
						this.out = htmlToElement(`<div class="dialog__out">${outSvg}</div>`);
					}
					info.querySelector('.dialog__time').classList.remove('full', true);
					info.prepend(this.out);
				}
			}

			dialog.querySelector('.dialog__short-msg').innerHTML = message;
			dialog.querySelector('.dialog__time').innerHTML = time;
			if (!getDialog(id).pinned) {
				this.normal.prepend(dialog);
			}
		});
	}

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
