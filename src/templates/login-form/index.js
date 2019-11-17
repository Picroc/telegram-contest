import './login-form.scss';
import template from './login-form.html';
import { CountryApiService } from '../../utils/services';
import * as emojiFlags from 'emoji-flags';
import { htmlToElement } from '../../helpers/index';

let cntr = [];

let router;

const getMaskedValue = text => {
	checkIsInvalid();
	const newText = text.replace(/\D/g, '').slice(0, 15);
	const idx = Math.max(newText.length - 10, 1);
	const code = newText.slice(0, idx);
	const number = newText.slice(idx);
	if (number.length >= 9)
		return `+${code} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8)}`;
	if (number.length >= 7) return `+${code} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
	if (number.length >= 5) return `+${code} ${number.slice(0, 3)} ${number.slice(3)}`;
	if (number.length >= 1) return `+${code} ${number.slice(0)}`;
	return `+${code}`;
};

const handleMaskedInput = event => {
	const value = event.target.value;
	if (!value) return;

	event.target.value = getMaskedValue(value);
};

const subscribe = element => {
	return function (...args) {
		document.querySelector(element).addEventListener(...args);
	};
};

const countriesPopup = coutries => {
	return coutries
		.map(country => {
			return `
            <li class='popup-item'>
                <span class='popup-item__flag'>${
				emojiFlags[country.alpha] ? emojiFlags[country.alpha].emoji : 'NONE'
				}</span>
                <span class='popup-item__name'>${country.name}</span>
                <span class='popup-item__code'>+ ${country.code}</span>
            </li>
        `;
		})
		.join('');
};

const onCodeChoice = event => {
	const code =
		event.target.tagName === 'LI'
			? event.target.querySelector('.popup-item__code').innerText
			: event.target.parentNode.querySelector('.popup-item__code').innerText;

	const name =
		event.target.tagName === 'LI'
			? event.target.querySelector('.popup-item__name').innerText
			: event.target.parentNode.querySelector('.popup-item__name').innerText;

	document.querySelector('.login-form__phone').value = getMaskedValue(code);
	document.querySelector('.login-form__country').value = name;
	onCountryOut();
};

const subscribePopupItems = () => {
	const items = document.getElementsByClassName('popup-item');

	// console.log(items);

	Array.from(items, item =>
		item.addEventListener('click', event => {
			event.stopPropagation();
			return onCodeChoice(event);
		})
	);
};

const filterCountries = value => {
	const filValue = value.toLowerCase();
	return cntr.filter(el => el.name.toLowerCase().includes(filValue));
};

const onCountyClick = event => {
	if (document.querySelector('.login-form__popup')) return;

	const elem = document.createElement('ul');
	elem.classList.add('login-form__popup');
	elem.classList.add('popup');
	elem.innerHTML = countriesPopup(event.target.value ? filterCountries(event.target.value) : cntr);
	event.target.parentNode.appendChild(elem);

	subscribePopupItems();
};

const onCountryChange = event => {
	const string = event.target.value;
	const elem = event.target.parentNode.querySelector('.login-form__popup');
	elem.innerHTML = countriesPopup(filterCountries(string));

	subscribePopupItems();
};

const onCountryOut = () => {
	const elem = document.querySelector('.login-form__popup');
	if (!elem) return;
	elem.remove();
};

const routeToNewPage = () => {
	router('login_code', {
		phone: document.querySelector('.login-form__phone').value,
		telegramApi,
	});
};

const showInvalid = () => {
	document.querySelector('.login-form__phone').classList.add('input-field_invalid');
	document.querySelector('.login-form__phone ~ label').innerHTML = 'Invalid phone';
};

const checkIsInvalid = () => {
	if (document.querySelector('.login-form__phone').classList.contains('input-field_invalid')) {
		document.querySelector('.login-form__phone').classList.remove('input-field_invalid');
		document.querySelector('.login-form__phone ~ label').innerHTML = 'Phone';
	}
};

const logIn = () => {
	const phone = document.querySelector('.login-form__phone').value;

	if (!phone || phone.length < 11) {
		showInvalid();
		return;
	}

	telegramApi.sendCode(phone).then(res => {
		telegramApi.sendSms(phone, res.phone_code_hash, res.next_type).then(() => {
			window.phone_code_hash = res.phone_code_hash;
			router('login_code', { phone: phone });
		});
	});
};

const countyApi = new CountryApiService();

export default (elem, rt) => {
	router = rt;
	elem.innerHTML = template;

	const subCountry = subscribe('.login-form__country');
	subCountry('focus', onCountyClick);
	// subCountry('focusout', onCountryOut);
	subscribe('body')('click', onCountryOut);
	subCountry('click', event => {
		event.stopPropagation();
	});
	subCountry('input', onCountryChange);
	subscribe('.login-form__phone')('input', handleMaskedInput);
	subscribe('.login-form__submit')('click', () => {
		logIn();
	});

	window.updateRipple();

	countyApi.getAllCountries().then(countries => {
		cntr = countries;
	});

	telegramApi
		.getUserInfo()
		.then(user => {
			if (user.id) {
				router('chat_page');
			}
		})
		.catch(err => {
			console.log(err);
		});
};
