import './dialog.scss';
import template from './dialog.html.js';
import {
	mapId,
	getDialogs,
	UPDATE_DIALOG_PHOTO,
	updateDialogPhoto,
	getArchives,
	getDialog,
} from '../../../store/store';

export default class Dialog extends HTMLElement {
	render() {
		const id = this.getAttribute('id').replace('dialog_', '');
		const dialog = getDialog(id);
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
		elem.src = getDialog(id).photo;
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
