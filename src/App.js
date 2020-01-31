import Login from './templates/login-form';
import LoginCode from './templates/login-code';
import LoginPassword from './templates/login-password';

import './assets/fonts.css';
import './assets/globals.scss';
import './assets/popup.scss';
import chatPage from './templates/chat-page';
import RegisterPage from './templates/register-page/index';
import LoginForm from './pages/login-form/login-form';
import Router from './components/router';
import CountriesPopupItem from './components/countries-popup-item/countries-popup-item';

customElements.define('my-router', Router);
customElements.define('login-form', LoginForm);
customElements.define('countries-popup-item', CountriesPopupItem);

const q = elem => document.querySelector(elem);
const App = q('.root');
const rt = document.getElementById('router');
export const router = (route, attrs) => {
	rt.setAttribute('route', route);
	Object.keys(attrs).map(attr => {
		rt.setAttribute(attr, JSON.stringify(attrs[attr]));
	});
};

let state = {
	history: ['register_page'],
};

const changeState = transform => {
	return function (...args) {
		const [oldState, newState] = [state, transform(...args)];

		state = {
			...oldState,
			...newState,
		};
	};
};

const subscribe = element => {
	return function (...args) {
		document.querySelector(element).addEventListener(...args);
	};
};

const switchPage = page => {
	switch (page) {
		case 'login':
			return Login;
		case 'login_code':
			return LoginCode;
		case 'login_password':
			return LoginPassword;
		case 'register_page':
			return RegisterPage;
		case 'chat_page':
			return chatPage;
		default:
			return () => {
				throw new ReferenceError('No such page');
			};
	}
};

export const routePage = (page, ...args) => {
	changeState(() => ({ history: [...state.history, page] }))();
	switchPage(page)(App, routePage, ...args);
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

function render() {
	// document.getElementById('router');
}

function onDocumentReady(callback) {
	document.addEventListener('DOMContentLoaded', callback);
}

onDocumentReady(render);
