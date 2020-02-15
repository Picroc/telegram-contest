import template from './login-code.html';
import './login-code.scss';

import { router, telegramApi } from '../../App';
import { getUser, addToUser, setUser } from '../../store/store';

import { idle, track as peek } from '../../utils/anim-monkey';

import lottie from 'lottie-web';

const getAnimationItem = (elem, data, options) => () =>
	lottie.loadAnimation({
		container: document.querySelector(elem),
		renderer: 'svg',
		loop: options.loop || false,
		autoplay: options.auto || false,
		animationData: data,
	});

const translateAnimation = (to, time) => {
	window.current_animation.play();
	window.current_animation.addEventListener('loopComplete', () => {
		window.current_animation.destroy();
		window.current_animation = to();
		time && window.current_animation.goToAndStop(time, true);
	});
	setTimeout(() => {
		window.current_animation.destroy();
		window.current_animation = to();
		time && window.current_animation.goToAndStop(time, true);
	}, 500);
};

const getSegments = value => {
	switch (value) {
		case 0:
			return [0, 15];
		case 1:
			return [15, 30];
		case 2:
			return [30, 45];
		case 3:
			return [45, 60];
		case 4:
			return [60, 75];
		case 5:
			return [75, 90];
		case 6:
			return [90, 100];
	}
};

export default class LoginCode extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		this.innerHTML = template;
		this.code = this.querySelector('.login-code__code');
		this.code.addEventListener('input', this.validateCode);

		const monkey_idle = getAnimationItem('.cd-tgsticker', idle, {
			auto: true,
			loop: true,
		});
		const monkey_peek = getAnimationItem('.cd-tgsticker', peek, {
			auto: false,
		});

		window.current_animation = monkey_idle();

		this.code.addEventListener('focus', ({ target }) => {
			translateAnimation(monkey_peek, Math.max(target.value.length, 1) + 25);
		});

		this.code.addEventListener('focusout', () => {
			translateAnimation(monkey_idle);
		});

		this.code.addEventListener('input', event => {
			const segments =
				event.target.value.length > prev_input
					? getSegments(event.target.value.length)
					: getSegments(event.target.value.length).reverse();
			window.current_animation.playSegments(segments, true);
			prev_input = event.target.value.length;
		});
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
					router('chat-page');
				})
				.catch(err => {
					// console.log('Got error');
					if (err === 'PHONE_NUMBER_UNOCCUPIED') {
						router('register-page', { phone, code });
					} else if (err.type === 'SESSION_PASSWORD_NEEDED') {
						router('login-password');
					} else {
						console.log(err);
						this.showInvalid();
					}
				});
		}

		this.code.value = newText;
	};

	showInvalid = () => {
		this.code.classList.add('input-field_invalid');
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
