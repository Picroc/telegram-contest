import template from './login-code.html';
import './login-code.scss';

import lottie from 'lottie-web';
import { idle, track as peek } from '../../utils/anim-monkey';
import { router } from '../../App';
import { setInnerHTML } from '../../helpers/index';

export default class LoginCode extends HTMLElement {
	constructor() {
		super();
		this.monkey_idle = this.getAnimationItem('.cd-tgsticker', idle, {
			auto: true,
			loop: true,
		});
		this.monkey_peek = this.getAnimationItem('.cd-tgsticker', peek, {
			auto: false,
		});
	}
	render() {
		this.innerHTML = template;
		this.code = this.querySelector('.login-code__code');
		this.prevInputLength = this.code.value.length;
		this.setLabel = setInnerHTML('.login-code__code ~ label');
		this.phone = this.getAttribute('phone');
		this.current_animation = this.monkey_idle;
		const { length } = this.code.value;
		const c = this.code.addEventListener;
		c('focus', ({ target }) => {
			this.translateAnimation(this.monkey_peek, Math.max(length, 1) + 25);
		});
		c('focusout', () => {
			this.translateAnimation(this.monkey_idle);
		});
		c('change', event => {
			const { length } = this.code.value;
			const segments =
				length > this.prevInputLength ? this.getSegments(length) : this.getSegments(length).reverse();
			this.current_animation.playSegments(segments, true);
			this.prev_input = length;
		});
		c('change', this.validateCode);
	}

	validateCode = () => {
		this.checkIsInvalid();
		const code = this.code.value;

		const newText = code.replace(/\D/g, '').slice(0, 5);

		if (newText.length === 5) {
			telegramApi
				.signIn(phone, window.phone_code_hash, newText)
				.then(res => {
					if (res.type === 'SESSION_PASSWORD_NEEDED') {
						router('login_password');
					}
					router('chat_page');
				})
				.catch(err => {
					if (err.type === 'PHONE_NUMBER_UNOCCUPIED') {
						router('register_page', { phone, code });
					} else if (err.type === 'SESSION_PASSWORD_NEEDED') {
						router('login_password');
					} else {
						this.showInvalid();
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

	getAnimationItem = (elem, data, options) =>
		lottie.loadAnimation({
			container: document.querySelector(elem),
			renderer: 'svg',
			loop: options.loop || false,
			autoplay: options.auto || false,
			animationData: data,
		});

	connectedCallback() {
		this.render();
	}

	getSegments = value => {
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

	translateAnimation = (to, time) => {
		this.current_animation.play();
		this.current_animation.addEventListener('loopComplete', () => {
			this.current_animation.destroy();
			this.current_animation = to;
			time && this.current_animation.goToAndStop(time, true);
		});
		setTimeout(() => {
			this.current_animation.destroy();
			this.current_animation = to;
			time && this.current_animation.goToAndStop(time, true);
		}, 500);
	};
}
