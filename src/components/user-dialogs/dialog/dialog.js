import './dialog.scss';
import template from './dialog.html.js';
import { mapId, getDialogs, UPDATE_DIALOG_PHOTO, updateDialogPhoto, getUser, getArchives } from '../../../store/store';
import ChatMain from '../../../pages/chat-main/index';
import { telegramApi } from '../../../App';

export default class Dialog extends HTMLElement {
	render() {
		const id = this.getAttribute('id').replace('dialog_', '');
		const archived = JSON.parse(this.getAttribute('archived'));
		const dialogs = archived ? getArchives() : getDialogs();

		const dialog = dialogs[mapId(id)];
		if (dialog.photo instanceof Promise) {
			dialog.photo.then(photo => {
				updateDialogPhoto(id, photo);
			});
		}

		this.dialog = dialog;
		this.innerHTML = template(dialog);
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
