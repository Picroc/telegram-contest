import './menu.scss';
import template from './menu.html';
import { subscribe, createInput, createDiv } from '../../../helpers';
import img from './search.js';
import { TelegramApiWrapper } from '../../../utils/services';
import settings from './settings/index';


export default (elem, type, callback) => {
	const nav = document.createElement('nav');
	nav.className = 'menu';
	nav.innerHTML = template;
	nav.appendChild(search(type, callback));
	elem.appendChild(nav);
	const menu = document.querySelector('.menu-list');
	subscribe('#menu__checkbox')('click', () => menu.classList.toggle('menu-list_hidden'));
	subscribe('.menu-list__settings')('click', () => settings(elem, { name: 'Doge Dogeson', phone: '88005553535' }));
};

export const onType = event => {
	const userDialogs = document.getElementById('user-dialogs');
	if (!userDialogs.data) {
		userDialogs.data = Array.from(userDialogs.children);
	}
	userDialogs.innerHTML = '';
	const string = event.target.value.toLowerCase();
	Array.from(
		userDialogs.data.filter(el =>
			el
				.getAttribute('name')
				.toLowerCase()
				.includes(string)
		),
		el => userDialogs.appendChild(el)
	);
};

let currentSeacrhTimeout;
const tApi = new TelegramApiWrapper();

const onTypeContacts = (value, searchCallback = () => { }) => {
	if (value.length == 0) {
		clearTimeout(currentSeacrhTimeout);
		return;
	}

	if (currentSeacrhTimeout) clearTimeout(currentSeacrhTimeout);

	currentSeacrhTimeout = setTimeout(() => {
		tApi.searchPeers(value, 20)
			.then(res => {
				console.log(res);
				searchCallback(res);
			});
	}, 1000);
}

const search = (type, searchCallback) => {
	const searchWrapper = createDiv('menu__search-wrapper');
	const searchIcon = createDiv('menu__search-icon');
	searchIcon.innerHTML = img();
	const search = createInput('search', 'menu__search', 'Search');
	searchWrapper.appendChild(search);
	searchWrapper.appendChild(searchIcon);
	search.id = 'search';
	if (type === 'contacts') {
		subscribe(search)('input', event => { onType(event); onTypeContacts(event.target.value, searchCallback) });
	} else {
		subscribe(search)('input', onType);
	}

	return searchWrapper;
};
