import template from './login-code.html';
import './login-code.scss';
import { idle, track as peek } from '../../utils/anim-monkey';

import lottie from 'lottie-web';

const subscribe = element => {
	return function(...args) {
		document.querySelector(element).addEventListener(...args);
	};
};

const showInvalid = () => {
	document.querySelector('.login-code__code').classList.add('input-field_invalid');
	document.querySelector('.login-code__code ~ label').innerHTML = 'Invalid Code';
};

const checkIsInvalid = () => {
	if (document.querySelector('.login-code__code').classList.contains('input-field_invalid')) {
		document.querySelector('.login-code__code').classList.remove('input-field_invalid');
		document.querySelector('.login-code__code ~ label').innerHTML = 'Code';
	}
};

let router;
let phone;

const validateCode = event => {
	checkIsInvalid();
	const code = event.target.value;

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
					showInvalid();
				}
			});
	}

	event.target.value = newText;
};

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

let prev_input = -1;

export default (elem, rt, data = {}) => {
	elem.innerHTML = template;

	router = rt;
	phone = data.phone;

	elem.querySelector('.login-code__title').innerHTML = phone;

	const monkey_idle = getAnimationItem('.cd-tgsticker', idle, {
		auto: true,
		loop: true,
	});
	const monkey_peek = getAnimationItem('.cd-tgsticker', peek, {
		auto: false,
	});

	window.current_animation = monkey_idle();
	const loginCode = subscribe('.login-code__code');

	loginCode('focus', ({ target }) => {
		translateAnimation(monkey_peek, Math.max(target.value.length, 1) + 25);
	});
	loginCode('focusout', () => {
		translateAnimation(monkey_idle);
	});
	loginCode('input', event => {
		const segments =
			event.target.value.length > prev_input
				? getSegments(event.target.value.length)
				: getSegments(event.target.value.length).reverse();
		window.current_animation.playSegments(segments, true);
		prev_input = event.target.value.length;
	});
	loginCode('input', validateCode);
};
