import template from './login-code.html';
import './login-code.scss';

import { router, telegramApi } from '../../App';
import { getUser, addToUser } from '../../store/store';

export default class LoginCode extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		this.innerHTML = template;
		this.code = this.querySelector('.login-code__code');
		this.code.addEventListener('input', this.validateCode);
	}

	validateCode = event => {
		this.checkIsInvalid();
		const code = this.code.value;
		const phone = this.getAttribute('phone');
		const newText = code.replace(/\D/g, '').slice(0, 5);

		if (newText.length === 5) {
			telegramApi
				.signIn(phone, window.phone_code_hash, newText)
				.then(res => {
					if (res.type === 'SESSION_PASSWORD_NEEDED') {
						router('login-password');
					}
					telegramApi.getUserInfo().then(user => {
						console.log('HERE WE GO', user);
						setUser(user);
					});
					telegramApi
						.getUserPhoto(1)
						.then(res => {
							addToUser('avatar', res);
						})
						.catch(err => console.log('err', err));
				})
				.catch(err => {
					console.log('Got error');
					if (err.type === 'PHONE_NUMBER_UNOCCUPIED') {
						router('register-page', { phone, code });
					} else if (err.type === 'SESSION_PASSWORD_NEEDED') {
						router('login-password');
					} else {
						showInvalid();
					}
				});
		}

		this.code.value = newText;
	};

	showInvalid = () => {
		this.code.classList.add('input-field_invalid');
		this.setLabel('Invalid Code');
	};

	checkIsInvalid = () => {
		if (this.code.classList.contains('input-field_invalid')) {
			this.code.classList.remove('input-field_invalid');
			this.setLabel('Code');
		}
	};

	static get observedAttributes() {
		// (3)
		return ['phone'];
	}

	connectedCallback() {
		this.render();
	}
}
