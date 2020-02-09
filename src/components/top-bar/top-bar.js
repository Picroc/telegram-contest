import template from './top-bar.html.js';
import './top-bar.scss';
import { getDialogs, mapId, UPDATE_DIALOG_PHOTO, getDialog } from '../../store/store.js';
import { telegramApi } from '../../App.js';

export default class TopBar extends HTMLElement {
	render() {
		this.className = 'top-bar';
		const id = this.getAttribute('user_id');
		const dialog = getDialog(id);
		const {
			dialog_peer: { _: type },
		} = dialog;

		this.innerHTML = template(dialog);
		this.online = this.querySelector('.top-bar__online-info');
		telegramApi.getPeerByID(id).then(({ status }) => {
			this.online.innerHTML = this.statusTransform(status);
		});
		this.searchIcon = this.querySelector('.top-bar__search');
		this.avatar = this.querySelector('.top-bar__avatar img');
		this.addEventListener(UPDATE_DIALOG_PHOTO, this.updatePhotoListener);
		this.searchIcon.addEventListener('click', this.searchClick);
		this.addEventListener('click', this.showRightSideBar);
	}

	showRightSideBar = e => {
		const rightSidebar = document.getElementById('right-sidebar');
		rightSidebar.classList.toggle('right-sidebar_hidden');
	};

	unitCheck = unit => {
		if (unit > 1) {
			return 's';
		}

		return '';
	};

	statusTransform = ({ was_online: lastSeen, _: type }) => {
		switch (type) {
			case 'userStatusRecently':
				return `last seen recently`;

			case 'userStatusOffline':
				return this.lastSeenTransform(lastSeen);

			case 'userStatusOnline':
				return 'online';
		}
	};

	lastSeenTransform = lastSeen => {
		const unixShift = 1000;
		const now = new Date().getTime() / unixShift;
		const diff = Math.abs(now - lastSeen);
		const step = 60;
		let time;
		let unit;
		if (diff < step) {
			this.online.innerHTML = `last seen just now`;
			return;
		} else if (diff < step ** 2) {
			unit = new Date(diff * unixShift).getMinutes();
			time = 'minute';
		} else if (diff < step ** 2 * 24) {
			unit = new Date(lastSeen * unixShift).getHours();
			time = 'hour';
		} else if (diff < step ** 2 * 24 * 7) {
			unit = new Date(lastSeen * unixShift).getDay();
			time = 'day';
		} else if (diff < step ** 2 * 24 * 7 * 4) {
			unit = new Date(lastSeen * unixShift).getHours();
			time = 'week';
		} else if (diff < step ** 2 * 24 * 7 * 4 * 12) {
			unit = new Date(lastSeen * unixShift).getHours();
			time = 'month';
		} else {
			time = `long time`;
		}
		time = unit + ' ' + time + this.unitCheck(unit);
		return `last seen ${time} ago`;
	};

	updatePhotoListener = event => {
		const id = this.getAttribute('user_id');
		const {
			detail: { id: eventId },
		} = event;
		if (id === eventId) {
			const { photo } = getDialog(id);
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
