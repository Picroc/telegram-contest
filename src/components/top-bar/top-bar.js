import template from './top-bar.html.js';
import './top-bar.scss';
import { getDialogs, mapId, UPDATE_DIALOG_PHOTO } from '../../store/store.js';
import { telegramApi } from '../../App.js';

export default class TopBar extends HTMLElement {
	render() {
		this.className = 'top-bar';
		const id = this.getAttribute('user_id');
		const dialog = this.getInfo(id);
		const {
			dialog_peer: { _: type },
		} = dialog;

		this.innerHTML = template(dialog);
		this.online = this.querySelector('.top-bar__online-info');
		telegramApi.getPeerByID(id, type).then(({ sortStatus: lastSeen }) => {
			if (lastSeen) {
				this.online.innerHTML = `last seen at ${telegramApi._convertDate(lastSeen)}`;
			}
		});
		this.searchIcon = this.querySelector('.top-bar__search');
		this.avatar = this.querySelector('.top-bar__avatar img');
		this.addEventListener(UPDATE_DIALOG_PHOTO, this.updatePhotoListener);
		this.searchIcon.addEventListener('click', this.searchClick);
	}

	getInfo = id => getDialogs()[mapId(id)];

	updatePhotoListener = event => {
		console.log('top-bar', event);
		const id = this.getAttribute('user_id');
		const {
			detail: { id: eventId },
		} = event;
		if (id === eventId) {
			const { photo } = getDialogs()[mapId(id)];
			this.avatar.src = photo;
		}
	};

	searchClick = event => {
		const search = document.getElementById('search');
		search.focus();
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
