import template from './top-bar.html.js';
import './top-bar.scss';
import { getDialogs, mapId, UPDATE_DIALOG_PHOTO } from '../../store/store.js';

export default class TopBar extends HTMLElement {
	render() {
		this.className = 'top-bar';
		const id = this.getAttribute('user_id');
		const dialog = getDialogs()[mapId(id)];
		this.innerHTML = template(dialog);
		this.avatarSrc = this.querySelector('.top-bar__avatar').src;
		this.addEventListener(UPDATE_DIALOG_PHOTO, this.updatePhotoListener);
	}

	updatePhotoListener = event => {
		console.log('top-bar', event);
		const id = this.getAttribute('user_id');
		const { photo } = getDialogs()[mapId(id)];
		this.avatarSrc = photo;
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
