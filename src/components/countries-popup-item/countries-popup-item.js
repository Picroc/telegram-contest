import './countries-popup-item.scss';
import template from './countries-popup-item.html';
import * as emojiFlags from 'emoji-flags';
import { setInnerHTML } from '../../helpers/index';

export default class CountriesPopupItem extends HTMLElement {
	render() {
		this.innerHTML = template;
		const set = setInnerHTML.bind(this);
		const country = {
			name: this.getAttribute('name'),
			alpha: this.getAttribute('alpha'),
			code: this.getAttribute('code'),
			flagUrl: this.getAttribute('flagUrl'),
		};
		set('.popup-item__flag')(emojiFlags[country.alpha] ? emojiFlags[country.alpha].emoji : 'NONE');
		set('.popup-item__name')(country.name);
		set('.popup-item__code')(country.code);
	}

	connectedCallback() {
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}
}
