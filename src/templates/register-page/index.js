import template from './register-page.html';
import './register-page.scss';
import profileImage from '../profile-image/index';

const subscribe = element => {
	return function(...args) {
		document.querySelector(element).addEventListener(...args);
	};
};

let router;
let phone;
let code;

const handleRegister = () => {
	const name = document.querySelector('.register-page__name').value;
	const surname = document.querySelector('.register-page__surname').value;

	if (!name) {
		alert('Write name!');
		return;
	}

	telegramApi
		.signUp(phone, window.phone_code_hash, code, name, surname)
		.then(res => {
			router('chat_page');
		})
		.catch(err => {
			console.log('ERROR: ', err);
		});
};

export default (elem, rt, data) => {
	elem.innerHTML = template;

	phone = data.phone;
	code = data.code;
	router = rt;

	subscribe('.register-page__icon')('click', () => {
		profileImage();
	});

	subscribe('.register-page__submit')('click', handleRegister);
};
