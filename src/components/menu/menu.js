import './menu.scss';
import template from './menu.html';
import { subscribe } from '../../helpers';
import { getDialogs, getArchives } from '../../store/store';
import { hide, show, htmlToElement } from '../../helpers/index';

let currentSeacrhTimeout;
const tApi = window.telegramApi;

const onTypeContacts = (value, searchCallback = () => {}) => {
	if (value.length == 0) {
		clearTimeout(currentSeacrhTimeout);
		return;
	}

	if (currentSeacrhTimeout) {
		clearTimeout(currentSeacrhTimeout);
	}

	currentSeacrhTimeout = setTimeout(() => {
		tApi.searchPeers(value, 20).then(res => {
			console.log(res);
			searchCallback(res);
		});
	}, 1000);
};

// const search = (type, searchCallback) => {
// 	const searchWrapper = createDiv('menu__search-wrapper');
// 	const searchIcon = createDiv('menu__search-icon');
// 	searchIcon.innerHTML = img();
// 	const search = createInput('search', 'menu__search', 'Search');
// 	searchWrapper.appendChild(search);
// 	searchWrapper.appendChild(searchIcon);
// 	search.id = 'search';
// 	if (type === 'contacts') {
// 		subscribe(search)('input', event => {
// 			onType(event);
// 			onTypeContacts(event.target.value, searchCallback);
// 		});
// 	} else {
// 		subscribe(search)('input', onType);
// 	}

// 	return searchWrapper;
// };

export default class Menu extends HTMLElement {
	render() {
		this.innerHTML = template;
		this.menuList = this.querySelector('.menu-list');
		this.menuIcon = this.querySelector('.burger');
		this.search = this.querySelector('.menu__search');
		this.overlay = this.querySelector('.menu__search_overlay');
		this.checkbox = this.querySelector('.menu__checkbox');
		this.checkbox.addEventListener('click', this.menuClick);
		this.search.addEventListener('click', event => {
			if (this.overlay.classList.contains('hide')) {
				this.overlay.classList.toggle('hide');
				this.menuIcon.classList.toggle('arrow');
				this.menuIcon.classList.toggle('burger');
			}
		});
		subscribe('.menu-list__settings')('click', this.settingsClick);
		subscribe('.menu-list__archived')('click', this.archivesClick);
		// `<div class="dialog_right_bottom dialog__unread-count dialog_muted"><div class="count archived__count"></div></div>`
		// this.archivedCount = this.querySelector('.archived__count');
		// this.archivedCount.innerHTML = this.countArchives();
		this.countArchives();
	}

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	countArchives = () => {
		setTimeout(() => {
			let archives = getArchives();
			let counter = 0;
			for (const { unreadCount } of archives) {
				counter += +unreadCount;
			}
			if (counter > 0) {
				counter = counter > 100000 ? '99999+' : counter;
				this.archivedCount = htmlToElement(
					`<div class="dialog_right_bottom dialog__unread-count dialog_muted"><div class="count">${counter}</div></div>`
				);
				const menuArchived = this.querySelector('.menu-list__archived');
				menuArchived.appendChild(this.archivedCount);
			}
		}, 0);
	};

	archivesClick = e => {
		const archives = document.getElementById('archives');
		console.log(archives);
		archives.classList.toggle('sidebar_hidden');
	};

	settingsClick = e => {
		const left = document.querySelector('#left');
		let settings = document.querySelector('#settings');
		if (!settings) {
			settings = document.createElement('my-settings');
			left.appendChild(settings);
		}
		setTimeout(() => settings.classList.toggle('sidebar_hidden'), 0);
	};

	menuClick = e => {
		e.cancelBubble = true;
		if (this.menuIcon.classList.contains('arrow')) {
			return;
		}
		this.menuIcon.classList.toggle('menu__icon_active');
		this.menuList.classList.toggle('popup_hidden');
	};

	static get observedAttributes() {
		// (3)
		return [''];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
