// import MessageInput from './messageInput';
// import { htmlToElement } from '../../../../helpers';

// export default message => {
// 	return htmlToElement(MessageInput(message));
// };
import template from './message-input.html';
import microphoneSvg from './microphone.svg';
import attachSvg from './attach';
import emojiSvg from './emoji';
import sendArrow from './sendArrow.svg';
import './messageInput.scss';
import { setInnerHTML, setAttribute } from '../../helpers/index';

export default class MessageInput extends HTMLElement {
	render() {
		this.innerHTML = template;
		const setHTML = setInnerHTML.bind(this);
		const setAttr = setAttribute.bind(this);
		const message = this.getAttribute('value');
		setAttr('.text-input__input')('value', message);
		setHTML('.emoji-set')(emojiSvg());
		setHTML('.attach-media')(attachSvg());
	}

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return ['value'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
