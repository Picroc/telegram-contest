import './menu.scss';
import template from './menu.html';
import { subscribe, createInput, createDiv } from '../../../helpers';
import img from './search.js';
import settings from './settings/index';

export default elem => {
	const nav = document.createElement('nav');
	nav.className = 'menu';
	nav.innerHTML = template;
	nav.appendChild(search());
	elem.appendChild(nav);
	const menu = document.querySelector('.menu-list');
	subscribe('#menu__checkbox')('click', () => menu.classList.toggle('hidden'));
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

const search = () => {
	const searchWrapper = createDiv('menu__search-wrapper');
	const searchIcon = createDiv('menu__search-icon');
	searchIcon.innerHTML = img();
	const search = createInput('search', 'menu__search', 'Search');
	searchWrapper.appendChild(search);
	searchWrapper.appendChild(searchIcon);
	subscribe(search)('input', onType);
	search.id = 'search';
	return searchWrapper;
};
