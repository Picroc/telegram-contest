import template from './login-password.html';
import './login-password.scss';

import { router, telegramApi } from '../../App';
import { setInnerHTML } from '../../helpers/index';
import { setUser, addToUser } from '../../store/store';

export default class LoginPassword extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		this.innerHTML = template;
		this.password = this.querySelector('.login-password__password');
		this.setLabel = setInnerHTML('.login-password__password ~ label');
		this.submit = this.querySelector('.login-password__submit');

		this.submit.addEventListener('click', this.handlePassword);
		this.password.addEventListener('input', this.checkIsInvalid);
		this.password.addEventListener('keyup', event => {
			const enter = 13;

			if (event.keyCode === enter) {
				event.preventDefault();
				this.submit.click();
			}
		});
	}

	handlePassword = () => {
		telegramApi
			.signIn2FA(this.password.value)
			.then(res => {
				telegramApi.getUserInfo().then(user => {
					setUser(user);
				});
				telegramApi
					.getUserPhoto(1)
					.then(res => {
						addToUser('avatar', res);
					})
					.catch(err => console.log('err', err));
				router('chat-page');
			})
			.catch(err => {
				this.showInvalid();
			});
	};

	showInvalid = () => {
		this.password.classList.add('input-field_invalid');
		this.setLabel('Invalid password');
	};

	checkIsInvalid = () => {
		if (this.password.classList.contains('input-field_invalid')) {
			this.password.classList.remove('input-field_invalid');
			this.setLabel('Password');
		}
	};

	connectedCallback() {
		this.render();
	}
}
