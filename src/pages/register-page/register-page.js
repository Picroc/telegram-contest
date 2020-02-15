import template from './register-page.html';
import './register-page.scss';
import { convertToByteArray } from '../../utils/TelegramApi/js/lib/bin_utils';
import { telegramApi, router } from '../../App';
import { addToUser, setUser } from '../../store/store';

export default class RegisterPage extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		this.innerHTML = template;

		this.name = this.querySelector('.register-page__user-name');
		this.surname = this.querySelector('.register-page__user-surname');

		this.icon_button = this.querySelector('.register-page__icon');
		this.file_input = this.querySelector('.icon__file-select');
		this.submit = this.querySelector('.register-page__submit');

		this.icon_button.addEventListener('click', () => {
			this.file_input.click();
		});
		this.submit.addEventListener(
			'click',
			e => {
				e.preventDefault();
				// console.log(this.name);
				if (!this.name.value) {
					this.showInvalid();
					return;
				}
				this.signUp();
			},
			false
		);

		this.file_input.addEventListener(
			'change',
			event => {
				this.handleFile(event.srcElement.files[0]);
			},
			false
		);

		const dragPrevent = e => {
			e.stopPropagation();
			e.preventDefault();
		};

		this.icon_button.addEventListener('dragenter', dragPrevent, false);
		this.icon_button.addEventListener('dragover', dragPrevent, false);

		this.icon_button.addEventListener('drop', e => {
			e.stopPropagation();
			e.preventDefault();

			const trans = e.dataTransfer;
			const file = trans.files[0];
		});
	}

	handleFile(file) {
		if (file) {
			this.file = file;
			this.updatePhoto(file);
		}
	}

	showInvalid = () => {
		this.name.classList.add('input-field_invalid');

		if (this.invalidTimer) {
			clearTimeout(this.invalidTimer);
		}
		this.invalidTimer = setTimeout(() => {
			if (this.name.classList.contains('input-field_invalid')) {
				this.name.classList.remove('input-field_invalid');
			}
		}, 3000);
	};

	uploadPhoto = async bytes => {
		return await telegramApi.editUserPhoto(bytes);
	};

	updatePhoto = justFile => {
		const image = document.createElement('img');

		image.style = 'width: 160px; height: 160px;';

		image.src = window.URL.createObjectURL(new Blob([justFile]));

		this.icon_button.querySelector('.icon_display').style = 'display:none;';
		const prev = this.icon_button.querySelector('img');
		if (prev) {
			prev.remove();
		}
		this.icon_button.appendChild(image);

		// this.uploadPhoto(this.file);
	};

	signUp = () => {
		const phone = JSON.parse(this.getAttribute('phone')),
			code = this.getAttribute('code');

		telegramApi
			.signUp(phone, window.phone_code_hash, code, this.name.value, this.surname.value)
			.then(res => {
				return telegramApi.getUserInfo().then(user => {
					setUser(user);
				});
			})
			.then(() => {
				if (this.file) {
					setTimeout(() => {
						this.uploadPhoto(this.file)
							.then(() => {
								router('chat-page');
								telegramApi
									.getUserPhoto(1)
									.then(res => {
										addToUser('avatar', res);
									})
									.catch(err => console.log('err', err));
							})
							.catch(err => {
								alert("Sorry, we couldn't process your photo. Try again another time.");

								router('chat-page');
							});
					}, 100);
				} else {
					router('chat-page');
				}
			})
			.catch(err => {});
	};

	connectedCallback() {
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return ['phone', 'code'];
	}

	attributeChangedCallback() {
		this.render();
	}
}
