import './menu.scss';
import template from './menu.html';
import { subscribe } from '../../helpers';
import { getDialogs } from '../../store/store';
import { hide, show } from '../../helpers/index';

export const onType = event => {
	//TODO: добавить поиск по алиасу ( и мб что-то ещё кроме названия чата)
	const dialogs = getDialogs();
	const string = event.target.value.toLowerCase();
	for (const dialog of dialogs) {
		const el = document.getElementById(`dialog_${dialog.id}`);
		dialog.title = dialog.title.toLowerCase();
		if (!dialog.title.includes(string)) {
			hide(el);
		} else {
			show(el);
		}
	}
};

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
		const menuList = this.querySelector('.menu-list');
		const menuClick = e => {
			menuList.classList.toggle('menu-list_hidden');
		};
		const settingsClick = e => {
			const left = document.querySelector('#left');
			let settings = document.querySelector('#settings');
			if (!settings) {
				settings = document.createElement('my-settings');
				left.appendChild(settings);
			}
			setTimeout(() => settings.classList.toggle('sidebar_hidden'), 0);
		};
		subscribe('.menu__checkbox')('click', menuClick);
		subscribe('.menu-list__settings')('click', settingsClick);
		subscribe('.menu__search')('input', event => {
			onType(event);
			// onTypeContacts(event.target.value, () => {});
		});
	}

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return [''];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
