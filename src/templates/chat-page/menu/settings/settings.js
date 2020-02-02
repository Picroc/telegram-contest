// avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',

import template from './settings.html';
import './settings.scss';
import { setInnerHTML, setAttribute } from '../../../../helpers/index';
// import { htmlToElement, subscribe } from '../../../../helpers/index';
// import { routePage } from '../../../../App';
// info - { avatar, phone, name }

// const hide = settings => {
// 	settings.classList.toggle('sidebar_hidden', true);
// };

// const show = settings => {
// 	settings.classList.toggle('sidebar_hidden', false);
// };

// const logout = () => {
// 	telegramApi.logOut().then(() => {
// 		routePage('login');
// 	});
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

export default class TopBar extends HTMLElement {
	render() {
		this.innerHTML = template;
		const setHTML = setInnerHTML.bind(this);
		const setAttr = setAttribute.bind(this);
		const avatar =
			this.getAttribute('avatar') || 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg';
		setAttr('.settings__avatar')('src', avatar);
		const name = this.getAttribute('name');
		setHTML('settings__name')(name);
		const phone = this.getAttribute('phone');
		setHTML('settings__phone')(phone);
		const moreButton = this.querySelector('.settings__more');
		const moreButtonListener = event => {
			this.children[0].classList.toggle('hide'); //TODO: написать обработчик нажатия на кнопку настроек
		};
		moreButton.addEventListener('click', moreButtonListener);
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
		return ['avatar', 'name', 'phone'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
