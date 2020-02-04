import './dialog.scss';
import template from './dialog.html.js';
import { mapId, getDialogs, UPDATE_DIALOG_PHOTO, updateDialogPhoto, getUser } from '../../../store/store';
import ChatMain from '../../../templates/chat-page/chat-main/index';
import { telegramApi } from '../../../App';

export default class Dialog extends HTMLElement {
	render() {
		const id = this.getAttribute('id').replace('dialog_', '');
		const dialogs = getDialogs();
		const dialog = dialogs[mapId(id)];
		if (dialog.photo instanceof Promise) {
			dialog.photo.then(photo => {
				updateDialogPhoto(id, photo);
			});
		}

		const { id: userId } = getUser();
		if (id == userId) {
			dialog.savedMessages = true;
		}

		telegramApi.subscribeToUpdates('dialogs', data => {
			const { from_peer, to_peer, message, date } = data;
			console.log('data', data);
		});

		this.dialog = dialog;
		this.innerHTML = template(dialog);
		// this.addEventListener(UPDATE_DIALOG, this.updateDialogListener);
		this.addEventListener(UPDATE_DIALOG_PHOTO, this.updateDialogPhotoListener);
	}

	updateDialogListener = event => {
		this.render();
	};

	updateDialogPhotoListener = event => {
		event.preventDefault();
		const { id } = event.detail;
		const elem = this.querySelector('.dialog__avatar-wrapper img');
		if (elem) {
			elem.src = getDialogs()[mapId(id)].photo;
		}
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
