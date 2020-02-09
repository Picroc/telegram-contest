import './dialog.scss';
import template, { pinnedSvg } from './dialog.html.js';
import { UPDATE_DIALOG_PHOTO, updateDialogPhoto, getDialog, UPDATE_DIALOG_UNREAD } from '../../../store/store';

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
		this.rightBottom = this.querySelector('.dialog_right_bottom');
		this.addEventListener(UPDATE_DIALOG_PHOTO, this.updateDialogPhotoListener);
		this.addEventListener(UPDATE_DIALOG_UNREAD, this.updateDialogUnreadListener);
	}

	updateDialogListener = event => {
		this.render();
	};

	updateDialogUnreadListener = event => {
		event.preventDefault();
		const { id } = event.detail;
		const dialog = getDialog(id);
		const count = dialog.unread_count;
		if (count > 0) {
			this.rightBottom.classList.remove('dialog__pinned');
			this.rightBottom.classList.add('dialog__unread-count');
			this.rightBottom.innerHTML = `<div class="count">${count}</div>`;
		} else if (dialog.pinned) {
			this.rightBottom.classList.add('dialog__pinned');
			this.rightBottom.innerHTML = pinnedSvg;
		}
	};

	updateDialogPhotoListener = event => {
		event.preventDefault();
		const { id } = event.detail;
		const elem = this.querySelector('.dialog__avatar-wrapper img');
		if (elem) {
			elem.src = getDialog(id).photo;
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
