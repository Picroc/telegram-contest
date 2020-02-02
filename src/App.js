import './assets/fonts.css';
import './assets/globals.scss';
import './assets/popup.scss';
import LoginForm from './pages/login-form/login-form';
import Router from './components/router';
import CountriesPopupItem from './components/countries-popup-item/countries-popup-item';
import BubbleMessage from './components/bubbles/bubbleMessage';
import MessageInput from './components/message-input/messageInput';
import ProfileImage from './components/profile-image/profile-image';
import LoginCode from './pages/login-code/login-code';
import TopBar from './components/top-bar/top-bar';
import TelegramApi from './utils/TelegramApi/index';
import LoginPassword from './pages/login-password/login-password';
import ChatPage from './pages/chat-page/chat-page';

customElements.define('my-router', Router);
customElements.define('countries-popup-item', CountriesPopupItem);
customElements.define('bubble-message', BubbleMessage);
customElements.define('message-input', MessageInput);
customElements.define('profile-image', ProfileImage);
customElements.define('top-bar', TopBar);

customElements.define('login-form', LoginForm);
customElements.define('login-code', LoginCode);
customElements.define('login-password', LoginPassword);
customElements.define('chat-page', ChatPage);

const rt = document.getElementById('router');
export const router = (route, attrs = {}) => {
	rt.setAttribute('route', route);
	Object.keys(attrs).map(attr => {
		rt.firstChild.setAttribute(attr, JSON.stringify(attrs[attr]));
	});
};

export const telegramApi = new TelegramApi();

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
