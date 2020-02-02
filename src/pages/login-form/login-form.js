import './login-form.scss';
import template from './login-form.html';
import { setInnerHTML, hide, htmlToElement, show, setNotActive, setActive } from '../../helpers/index';
import countries from './countries.json';
import { router, telegramApi } from '../../App';

export default class LoginForm extends HTMLElement {
	constructor() {
		super();
		this.countries = countries;
	}

	render() {
		this.innerHTML = template;
		this.set = setInnerHTML.bind(this);

		this.phone = this.querySelector('.login-form__phone');
		this.submit = this.querySelector('.submit');
		this.popup = this.querySelector('.login-form__popup');
		this.country = this.querySelector('.login-form__country');
		this.checkbox = this.querySelector('#keep');
		this.label = this.querySelector('.login-form__phone ~ label');

		this.setLabel = this.set('.login-form__phone ~ label');
		this.setSubmitLabel = this.set('.submit span');
		this.countries.forEach(this.renderCountry);

		this.addEventListener('click', this.onCountryOut);

		this.country.addEventListener('focus', this.onCountryClick);
		this.country.addEventListener('click', event => event.stopPropagation());
		this.country.addEventListener('input', this.filterCountries);

		this.popup.active = -1;

		this.country.addEventListener('keyup', this.countryKeyListener);

		this.phone.addEventListener('keyup', event => {
			const enter = 13;

			if (event.keyCode === enter) {
				this.submit.click();
			}
		});

		this.checkbox.addEventListener('change', event => event.stopPropagation());

		this.submit.addEventListener('click', this.logIn);

		this.phone.addEventListener('input', this.handleMaskedInput);

		fetch('http://ip-api.com/json')
			.then(response => response.json())
			.then(data => {
				Array.from(this.popup.children, elem => {
					if (elem.getAttribute('alpha') === data.countryCode) {
						this.country.value = elem.getAttribute('name');
						this.phone.value = this.getMaskedValue(elem.getAttribute('code'));
					}
				});
			});
	}

	renderCountry = country => {
		const name = JSON.stringify(country.name);
		const flagUrl = JSON.stringify(country.flagUrl);
		const code = JSON.stringify(country.code);
		const alpha = JSON.stringify(country.alpha);
		const item = htmlToElement(
			`<countries-popup-item name=${name} flagUrl=${flagUrl} code=${code} alpha=${alpha}></countries-popup-item>`
		);

		item.addEventListener('click', this.onCodeChoice);

		this.popup.appendChild(item);
	};

	getMaskedValue = text => {
		this.checkIsInvalid();
		const newText = text.replace(/\D/g, '').slice(0, 15);
		const idx = Math.max(newText.length - 10, 1);
		const code = newText.slice(0, idx);
		const number = newText.slice(idx);
		if (number.length >= 9) {
			return `+${code} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8)}`;
		}
		if (number.length >= 7) {
			return `+${code} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
		}
		if (number.length >= 5) {
			return `+${code} ${number.slice(0, 3)} ${number.slice(3)}`;
		}
		if (number.length >= 1) {
			return `+${code} ${number.slice(0)}`;
		}
		return `+${code}`;
	};

	countryKeyListener = event => {
		const up = 38;
		const down = 40;
		const enter = 13;

		event.stopPropagation();

		const { active } = this.popup;
		const { length } = this.popup.children;
		let next;
		const update = this.updatePopup(active);

		switch (event.keyCode) {
			case down:
				next = (active + 1) % length;
				break;

			case up: {
				if (active === -1) {
					return;
				}
				next = active - 1 >= 0 ? active - 1 : length - 1;
				break;
			}

			case enter: {
				this.popup.children[this.popup.active].children[0].click();
				return;
			}
		}

		update(next);
	};

	updatePopup = active => next => {
		if (active !== -1) {
			setNotActive(this.popup.children[active]);
		}

		setActive(this.popup.children[next]);
		this.popup.active = next;
		this.popup.children[next].scrollIntoView({
			block: 'nearest',
		});
	};

	handleMaskedInput = () => {
		const { value } = this.phone;
		if (!value) {
			return;
		}

		this.phone.value = this.getMaskedValue(value);
	};

	checkIsInvalid() {
		if (this.phone.classList.contains('input-field_invalid')) {
			this.phone.classList.remove('input-field_invalid');
			this.setLabel('Phone');
		}
	}

	logIn = () => {
		this.submit.classList.add('submit_loading');
		this.set('.submit span')('PLEASE WAIT');
		const phone = this.phone.value;

		if (!phone || phone.length < 11) {
			showInvalid();
			return;
		}

		telegramApi.sendCode(phone).then(res => {
			telegramApi.sendSms(phone, res.phone_code_hash, res.next_type).then(() => {
				window.phone_code_hash = res.phone_code_hash;
				router('login-code', { phone: phone });
			});
		});
	};

	connectedCallback() {
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	routeToNewPage() {
		router('login_code', {
			phone: this.phone.value,
		});
	}

	showInvalid() {
		this.phone.classList.add('input-field_invalid');
		this.phone.innerHTML = 'Invalid phone';
		this.submit.classList.remove('submit_loading');
		this.setSubmitLabel('NEXT');
	}

	onCountryOut = event => {
		if (this.popup.classList.contains('hide')) {
			return;
		}
		hide(this.popup);
		~this.popup.active && setNotActive(this.popup.children[this.popup.active]);
		this.popup.active = -1;
		return false;
	};

	onCountryClick = event => {
		show(this.popup);
		return false;
	};

	filterCountries = event => {
		Array.from(this.popup.children, elem => {
			const name = elem.getAttribute('name').toLocaleLowerCase();
			const value = this.country.value.toLocaleLowerCase();
			name.includes(value) ? show(elem) : hide(elem);
		});
	};

	onCodeChoice = event => {
		const code =
			event.target.tagName === 'LI'
				? event.target.querySelector('.popup-item__code').innerText
				: event.target.parentNode.querySelector('.popup-item__code').innerText;

		const name =
			event.target.tagName === 'LI'
				? event.target.querySelector('.popup-item__name').innerText
				: event.target.parentNode.querySelector('.popup-item__name').innerText;

		this.phone.value = this.getMaskedValue(code);
		this.country.value = name;

		this.onCountryOut();

		return false;
	};
}
