import './dialog.scss';
import template, { pinnedSvg } from './dialog.html.js';
import {
	UPDATE_DIALOG_PHOTO,
	updateDialogPhoto,
	getDialog,
	UPDATE_DIALOG_UNREAD,
	UPDATE_DIALOG_STATUS,
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
		this.rightBottom = this.querySelector('.dialog_right_bottom');
		this.avatar = this.querySelector('.dialog__avatar-wrapper');
		this.addEventListener(UPDATE_DIALOG_PHOTO, this.updateDialogPhotoListener);
		this.addEventListener(UPDATE_DIALOG_UNREAD, this.updateDialogUnreadListener);
		this.addEventListener(UPDATE_DIALOG_STATUS, this.updateDialogStatusListener);
	}

	updateDialogListener = event => {
		this.render();
	};

	updateDialogStatusListener = ({ status }) => {
		const {
			dialog_peer: { _: type },
		} = this.dialog;
		if (type === 'peerUser') {
			this.avatar.classList.toggle('dialog__avatar_online', status);
		}
	};

	updateDialogUnreadListener = event => {
		event.preventDefault();
		const { id, count } = event.detail;
		const dialog = getDialog(id);

		if (count > 0 && dialog.pinned) {
			this.rightBottom.classList.remove('dialog_pinned');
		}
		if (count > 0) {
			this.rightBottom.classList.add('dialog__unread-count');
			this.rightBottom.innerHTML = `<div class="count">${count}</div>`;
		} else if (dialog.pinned) {
			this.rightBottom.classList.remove('dialog__unread-count');
			this.rightBottom.classList.add('dialog_pinned');
			this.rightBottom.innerHTML = pinnedSvg;
		} else {
			this.rightBottom.classList.remove('dialog__unread-count');
			this.rightBottom.innerHTML = '';
		}
	};

	updateDialogPhotoListener = event => {
		event.preventDefault();
		const { id } = event.detail;
		const elem = this.avatar.querySelector('img');
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
