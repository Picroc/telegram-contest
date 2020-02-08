import './archives.scss';
import chatMain from '../../../pages/chat-main/index';
import { htmlToElement, startLoading, stopLoading, createDiv } from '../../../helpers/index';
import { getArchives, SET_ARCHIVES, APPEND_ARCHIVES } from '../../../store/store';
import template from './archives.html';
import { renderDialog } from '../../user-dialogs/user-dialogs';
import { telegramApi } from '../../../App';
export default class Archives extends HTMLElement {
	render() {
		this.innerHTML = template;
		this.id = 'archives';
		this.className = 'sidebar sidebar_left archives sidebar_hidden';
		this.userDialogs = this.querySelector('.user-dialogs');
		this.userDialogs.id = 'archivesUserDialogs';
		this.renderDialog = renderDialog(this, true);

		this.addEventListener(SET_ARCHIVES, this.setListener, { capture: true });
		this.addEventListener(APPEND_ARCHIVES, this.updateListener, { capture: true });
		this.backButton = this.querySelector('.archives__back');
		this.backButton.addEventListener('click', this.backButtonListener);
		this.pinned = createDiv('pinned');
		this.pinned.id = 'pinned_dialogs';
		this.normal = createDiv('normal');
		this.normal.id = 'normal_dialogs';
		this.userDialogs.appendChild(this.pinned);
		this.userDialogs.appendChild(this.normal);
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
		getArchives().forEach(this.renderDialog);
	};

	updateListener = event => {
		const archives = getArchives(event.detail.length);
		archives.forEach(this.renderDialog);
	};

	backButtonListener = e => {
		this.classList.toggle('sidebar_hidden');
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
