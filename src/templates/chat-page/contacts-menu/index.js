import './contacts-menu.scss';
import Contact from './contact';
import { subscribe } from '../../../helpers';
import { loadDialog } from '..';

export default async elem => {
	menu = document.createElement('div');

	return menu;
};

export const updateSearchResults = async res => {
	const menu = document.createElement('div');
	document.querySelector('#user-dialogs').appendChild(menu);

	menu.innerHTML = '';
	if (res.length > 0) {
		const title = document.createElement('div');
		title.classList.add('contacts-title');
		title.innerHTML = `
            <h3>Contacts and Chats</h3>
        `;
		menu.appendChild(title);

		res.forEach(async el => {
			const item = document.createElement('div');

			item.innerHTML = Contact({
				title: el.title,
				text: el.text,
				isOnline: el.status ? (el.status._ === 'userStatusOnline' ? true : false) : false,
			});

			menu.appendChild(item);
			subscribe(item)('click', () => {
				loadDialog(el.peer);
			});
		});

		window.updateRipple();
	}
};
