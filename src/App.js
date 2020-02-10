import './assets/fonts.css';
import './assets/globals.scss';
import './assets/popup.scss';
import { setUser, addToUser } from './store/store';
import Router from './components/router';
import LoginForm from './pages/login-form/login-form';
import LoginCode from './pages/login-code/login-code';
import LoginPassword from './pages/login-password/login-password';
import ChatPage from './pages/chat-page/chat-page';

import CountriesPopupItem from './components/countries-popup-item/countries-popup-item';
import BubbleMessage from './components/bubbles/bubbleMessage';
import MessageInput from './components/message-input/messageInput';
import ProfileImage from './components/profile-image/profile-image';
import TopBar from './components/top-bar/top-bar';
import TelegramApi from './utils/TelegramApi/index';
import Menu from './components/menu/menu';
import Settings from './components/menu/settings/settings';
import UserDialogs from './components/user-dialogs/user-dialogs';
import Dialog from './components/user-dialogs/dialog/dialog';
import ChatMessage from './components/chat-message/chatMessage';
import RegisterPage from './pages/register-page/register-page';
import Archives from './components/menu/archives/archives';
import RightSidebar from './components/right-sidebar/right-sidebar';
import SearchList from './components/search-list/search-list';

import { show, hide } from './helpers/index';

customElements.define('my-router', Router);
customElements.define('countries-popup-item', CountriesPopupItem);
customElements.define('bubble-message', BubbleMessage);
customElements.define('message-input', MessageInput);
customElements.define('profile-image', ProfileImage);
customElements.define('top-bar', TopBar);
customElements.define('my-menu', Menu);
customElements.define('my-settings', Settings);
customElements.define('user-dialogs', UserDialogs);
customElements.define('my-dialog', Dialog);
customElements.define('search-list', SearchList);

customElements.define('login-form', LoginForm);
customElements.define('login-code', LoginCode);
customElements.define('login-password', LoginPassword);
customElements.define('register-page', RegisterPage);
customElements.define('chat-page', ChatPage);
customElements.define('chat-message', ChatMessage);
customElements.define('my-archives', Archives);
customElements.define('right-sidebar', RightSidebar);

const rt = document.getElementById('router');
export const router = (route, attrs = {}) => {
	rt.setAttribute('route', route);
	Object.keys(attrs).map(attr => {
		rt.firstChild.setAttribute(attr, JSON.stringify(attrs[attr]));
	});
};

export const telegramApi = new TelegramApi();

telegramApi
	.getUserInfo()
	.then(user => {
		console.log('HERE WE GO', user);
		setUser(user);
		if (user.id) {
			router('chat-page');
		} else {
			return true;
		}
	})
	.then(res => {
		if (res) {
			router('login-form');
		}
	})
	.catch(err => {
		console.log('LOGIN ERR', err);
	});

telegramApi
	.getUserPhoto(1)
	.then(res => {
		addToUser('avatar', res);
	})
	.catch(err => console.log('err', err));

const changeState = transform => {
	return function (...args) {
		const [oldState, newState] = [state, transform(...args)];

		state = {
			...oldState,
			...newState,
		};
	};
};

window.updateRipple = () => {
	[].map.call(document.querySelectorAll('[anim="ripple"]'), el => {
		el.addEventListener('click', e => {
			e = e.touches ? e.touches[0] : e;
			const r = el.getBoundingClientRect(),
				d = Math.sqrt(Math.pow(r.width, 2) + Math.pow(r.height, 2)) * 2;
			el.style.cssText = `--s: 0; --o: 1;`;
			el.offsetTop;
			el.style.cssText = `--t: 1; --o: 0; --d: ${d}; --x:${e.clientX - r.left}; --y:${e.clientY - r.top};`;
		});
	});
};

document.addEventListener('click', event => {
	let target = event.target;
	if (target.attributes.length === 0) {
		target = target.parentNode.parentNode;
	}
	if (target.tagName === 'IMG' || target.tagName === 'SVG' || target.classList.contains('burger')) {
		target = target.parentNode;
	}
	const popup = document.querySelector('.popup');
	const icon = document.querySelector('.menu__icon_active');
	if (popup && !target.contains(popup) && icon) {
		popup.classList.add('popup_hidden');
		icon.classList.remove('menu__icon_active');
	}
});

document.addEventListener('click', event => {
	const search = document.getElementById('search');
	const icon = document.querySelector('.menu .menu__icon');
	const searchOverlay = document.querySelector('.menu__search_overlay');
	const userDialogs = document.getElementById('user-dialogs');
	const searchList = document.getElementById('search-list');

	if (event.target !== search) {
		searchOverlay.classList.add('hide');
		icon.classList.add('burger');
		icon.classList.remove('arrow');
		show(userDialogs);
		hide(searchList);
		searchList.classList.add('search-list_hidden');
	} else {
		searchOverlay.classList.remove('hide');
		hide(userDialogs);
		show(searchList);
		setZeroTimeout(() => searchList.classList.remove('search-list_hidden'));
	}
});
