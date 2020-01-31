import './countries-popup-item.scss';
import template from './countries-popup-item.html';
import * as emojiFlags from 'emoji-flags';
import { setInnerHTML } from '../../helpers/index';

class CountriesPopupItem extends HTMLElement {
    render() {
        this.innerHTML = template;
        const set = setInnerHTML.bind(this);
        const country = JSON.parse(this.getAttribute('country'));
        set('.popup-item__flag')(emojiFlags[country.alpha] ? emojiFlags[country.alpha].emoji : 'NONE');
        set('.popup-item__name')(country.name);
        set('.popup-item__code')(contry.code);
    }

    connectedCallback() { // (2)
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() { // (3)
        return ['country'];
    }

    attributeChangedCallback(name, oldValue, newValue) { // (4)
        this.render();
    }
}

customElements.define("countries-popup-item", CountriesPopupItem);