// avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',

import template from './settings.html';
import './settings.scss';
import { setInnerHTML, setAttribute } from '../../../helpers/index';
import { telegramApi, router } from '../../../App';
import { getUser } from '../../../store/store';

export default class Settings extends HTMLElement {
	render() {
		this.id = 'settings';
		this.className = 'sidebar sidebar_left settings sidebar_hidden';
		this.innerHTML = template;
		const setHTML = setInnerHTML.bind(this);
		const user = getUser();
		this.avatar = user.avatar;
		document.querySelector('.settings__avatar_img').src = user.avatar;
		this.name = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
		setHTML('.settings__name')(this.name);
		this.phone = user.phone;

		setHTML('.settings__phone')(this.phone);

		this.moreButton = this.querySelector('.settings__more');
		this.moreButton.addEventListener('click', this.moreButtonListener);

		this.backButton = this.querySelector('.settings__back');
		this.backButton.addEventListener('click', this.backButtonListener);

		this.logout = this.querySelector('.more-list__logout');
		this.logout.addEventListener('click', this.logoutHandler);
	}

	backButtonListener = e => {
		this.classList.toggle('sidebar_hidden');
	};

	logoutHandler = () => {
		telegramApi.logOut().then(() => {
			router('login-form');
		});
	};

	moreButtonListener = e => {
		this.moreButton.children[1].classList.toggle('popup_hidden');
	};

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return ['avatar', 'name', 'phone'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}

// import { htmlToElement, subscribe } from '../../../../helpers/index';
// import { routePage } from '../../../../App';
// info - { avatar, phone, name }

// const hide = settings => {
// 	settings.classList.toggle('sidebar_hidden', true);
// };

// const show = settings => {
// 	settings.classList.toggle('sidebar_hidden', false);
// };

// let cashed;

// export default (elem, info) => {
// 	if (!cashed) {
// 		const settings = htmlToElement(template(info));
// 		elem.prepend(settings);
// 		cashed = settings;
// 		telegramApi.getUserInfo().then(res => {
// 			document.querySelector('.settings__name').innerHTML =
// 				res.first_name + (res.last_name ? ' ' + res.last_name : '');
// 			document.querySelector('.settings__phone').innerHTML = '+' + res.phone;
// 		});
// 		telegramApi.getUserPhoto('blob', 'small').then(res => {
// 			console.log(res);
// 			const urlCreator = window.URL || window.webkitURL;
// 			const imageUrl = urlCreator.createObjectURL(res);
// 			document.querySelector('.settings__avatar img').src = imageUrl;
// 		});
// 		subscribe('.settings__back')('click', () => hide(settings));
// 		subscribe('.settings-list__logout')('click', () => logout());
// 	}

// 	setTimeout(() => show(cashed), 0);
// };
