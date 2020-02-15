import template from './login-password.html';
import './login-password.scss';

import { router, telegramApi } from '../../App';
import { setInnerHTML } from '../../helpers/index';
import { setUser, addToUser } from '../../store/store';

import lottie from 'lottie-web';

import { idle, peek, close_peek } from '../../utils/anim-monkey';

const getAnimationItem = (elem, data, options) => () =>
	lottie.loadAnimation({
		container: document.querySelector(elem),
		renderer: 'svg',
		loop: options.loop || false,
		autoplay: options.auto || false,
		animationData: data,
	});

const animFromCloseToPeek = reverse => {
	if (window.current_animation) {
		window.current_animation.destroy();
	}

	const elem = '.cd-tgsticker';

	if (!reverse) {
		window.current_animation = getAnimationItem(elem, peek, {
			auto: true,
		})();
		window.current_animation.playSegments([32, 20], true);
	} else {
		window.current_animation = getAnimationItem(elem, peek, {
			auto: true,
		})();
		window.current_animation.playSegments([20, 32], true);
	}
};

const animFromCloseToIdle = reverse => {
	if (window.current_animation) {
		window.current_animation.destroy();
	}

	const elem = '.cd-tgsticker';

	if (!reverse) {
		window.current_animation = getAnimationItem(elem, close_peek, {
			auto: true,
		})();
		window.current_animation.playSegments([25, 0], true);
		window.current_animation.addEventListener('complete', () => {
			window.current_animation.destroy();

			window.current_animation = getAnimationItem(elem, idle, {
				auto: true,
				loop: true,
			})();
		});
	} else {
		window.current_animation = getAnimationItem(elem, close_peek, {
			auto: true,
		})();
		window.current_animation.playSegments([0, 25], true);
		window.current_animation.addEventListener('complete', () => {
			window.current_animation.destroy();
			window.current_animation = getAnimationItem(elem, peek, {
				auto: true,
			})();
			window.current_animation.goToAndStop(0, true);
		});
	}
};

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

		this.state = {
			password: true,
			closed: false,
		};

		window.current_animation = getAnimationItem('.cd-tgsticker', idle, {
			auto: true,
			loop: true,
		})();
		this.password.addEventListener('focus', () => {
			if (!this.state.closed) {
				animFromCloseToIdle(true);
				this.state.closed = true;
			}
		});
		this.querySelector('.login-password__eye').addEventListener('click', () => {
			this.password.setAttribute('type', this.state.password ? 'text' : 'password');
			animFromCloseToPeek(!this.state.password);
			this.state.password = !this.state.password;
			this.state.closed = true;
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
					.catch(err => {});
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
