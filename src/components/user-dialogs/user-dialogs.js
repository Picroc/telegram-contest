import { getDialogs, SET_DIALOGS, APPEND_DIALOGS, updateDialog, getUser, getDialog } from '../../store/store';
import { htmlToElement, startLoading, stopLoading, createDiv } from '../../helpers/index';
import chatMain from '../../templates/chat-page/chat-main/index';
import './user-dialogs.scss';
import { telegramApi } from '../../App';
import { outSvg } from './dialog/dialog.html';
export default class UserDialogs extends HTMLElement {
	render() {
		this.id = 'user-dialogs';
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

	renderDialog = dialog => {
		const { id, pinned } = dialog;
		const { id: userId } = getUser();
		if (id == userId) {
			dialog.savedMessages = true;
			dialog.title = 'Saved Messages';
		}

		const elem = htmlToElement(`<my-dialog anim="ripple" class="dialog" id="dialog_${id}"></my-dialog>`);
		elem.addEventListener('click', () => this.loadDialog(elem, dialog));

		if (pinned) {
			this.pinned.appendChild(elem);
		} else {
			this.normal.appendChild(elem);
		}
	};

	loadDialog = (elem, dialog) => {
		const { id, dialog_peer: peer } = dialog;
		if (this.prevActive) {
			if (this.prevId === id) {
				return;
			} else {
				this.prevActive.classList.toggle('dialog_active');
			}
		}
		this.prevActive = elem;
		this.prevId = id;

		elem.classList.toggle('dialog_active');
		const right = document.getElementById('right');
		startLoading(right);
		chatMain(right, peer).then(() => {
			stopLoading(right);
			const topBar = document.createElement('top-bar');
			topBar.setAttribute('user_id', id);
			right.prepend(topBar);
		});
	};

	setListener = event => {
		getDialogs().forEach(this.renderDialog);
	};

	updateListener = event => {
		const dialogs = getDialogs(event.detail.length);
		console.log('dialogs', dialogs);
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
