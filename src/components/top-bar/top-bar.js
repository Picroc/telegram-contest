import template from './top-bar.html.js';
import './top-bar.scss';
import {
	getDialogs,
	mapId,
	UPDATE_DIALOG_PHOTO,
	getDialog,
	updateDialogOnlineStatus,
	UPDATE_DIALOG_ONLINE_STATUS,
} from '../../store/store.js';
import { telegramApi } from '../../App.js';
import { reverse } from '../../helpers/index.js';

export default class TopBar extends HTMLElement {
	render = () => {
		this.className = 'top-bar';
		const id = this.getAttribute('user_id');
		const dialog = getDialog(id);
		const {
			dialog_peer: { _: type },
		} = dialog;
		this.innerHTML = template(dialog);
		this.loadStatus(id);

		this.online = this.querySelector('.top-bar__online-info');
		telegramApi.getFullPeer(id).then(data => console.log('data', data));
		this.searchIcon = this.querySelector('.top-bar__search');
		this.avatar = this.querySelector('.top-bar__avatar img');
		this.addEventListener(UPDATE_DIALOG_PHOTO, this.updatePhotoListener);
		this.addEventListener(UPDATE_DIALOG_ONLINE_STATUS, this.updateDialogOnlineStatusListener);
		this.searchIcon.addEventListener('click', this.searchClick);
		this.addEventListener('click', this.showRightSideBar);
	};

	updateDialogOnlineStatusListener = e => {
		const { id } = event.detail;
		if (id == this.getAttribute('user_id')) {
			this.online.innerHTML = getDialog(id).onlineStatus;
		}
	};

	showRightSideBar = e => {
		const rightSidebar = document.querySelector('.right-sidebar');
		rightSidebar.classList.toggle('right-sidebar_hidden');
		document.getElementById('right').classList.toggle('right_small');
		document.getElementById('message-input').classList.toggle('message-input_small');
	};

	unitCheck = unit => {
		if (unit > 1) {
			return 's';
		}

		return '';
	};

	transformNumber = number => {
		const str = reverse(String(number));
		let res = '';
		for (let i = 0; i < str.length; i++) {
			res += str[i];
			if ((i + 1) % 3 === 0 && i !== str.length - 1) {
				res += ',';
			}
		}
		return reverse(res);
	};

	loadStatus = id => {
		let onlineStatus;
		telegramApi
			.getPeerByID(id)
			.then(({ status, _: type, pFlags: { megagroup } }) => {
				if ((!status && megagroup) || type === 'chat') {
					return telegramApi.getChatParticipants(id);
				} else if (type === 'channel') {
					return telegramApi.getFullPeer(id);
				}
				onlineStatus = this.statusTransform(status);
			})
			.then(data => {
				if (!data) {
					return;
				}
				if (data.onlineUsers) {
					let {
						onlineUsers: { length: online },
						offlineUsers: { length: all },
					} = data;
					all = all + online;
					all = `${this.transformNumber(all)} ${all > 1 ? 'members' : 'member'}`;
					online = online && `${this.transformNumber(online)} online`;
					onlineStatus = online ? `${all}, ${online}` : all;
				} else {
					const count = data.full_chat.participants_count;
					const sub = 'subsriber' + this.unitCheck(count);
					onlineStatus = `${this.transformNumber(count)} ${sub}`;
				}
			})
			.then(() => {
				if (onlineStatus) {
					updateDialogOnlineStatus(id, onlineStatus);
				}
			});
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
			return `last seen just now`;
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
		event.cancelBubble = true;
		const search = document.getElementById('search');
		search.peerId = this.getAttribute('user_id');
		search.click();
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
