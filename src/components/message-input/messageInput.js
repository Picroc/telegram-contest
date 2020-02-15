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
import './mediaDrop.scss';
import './messageInput.scss';
import { setInnerHTML, setAttribute } from '../../helpers/index';
import { telegramApi } from '../../App';
import { getActivePeerId } from '../../store/store';

export default class MessageInput extends HTMLElement {
	render() {
		this.innerHTML = template;
		const setHTML = setInnerHTML.bind(this);

		setHTML('.attach-media')(attachSvg());
		this.attachMedia = this.querySelector('.attach-media');
		this.attachPopup = this.querySelector('.attach-media__popup');
		this.attachMedia.addEventListener('click', this.showAttachPopup);

		this.sendmediaBtn = this.querySelector('.attach-media__media');
		this.sendmediaBtn.addEventListener('click', this.sendMedia);

		this.mediaDrop = this.querySelector('.media-drop__paranja');

		this.inputArea = this.querySelector('.text-input__input');
		this.inputArea.addEventListener('input', this.inputHandler);
		this.inputArea.addEventListener('keyup', this.handleButton);

		setHTML('.emoji-set')(emojiSvg());
		this.emoji = this.querySelector('.emoji-set');
		this.emoji.addEventListener('mouseover', this.showEmoji);
		this.emoji.addEventListener('mouseout', this.hideEmoji);

		this.value = '';
		this.sendButton = this.querySelector('#send-button');
		this.sendButton.addEventListener('click', this.sendMessage);
	}

	handleButton = e => {
		console.log(e.code);
		if (e.shiftKey && e.code == 'Enter') {
			this.value += '\n';
		} else if (e.code == 'Backspace') {
			this.value = this.value.slice(0, -1);
		} else if (e.code == 'Enter') {
			e.cancelBubble = true;
			e.preventDefault();
			this.sendMessage();
		}
	};

	showAttachPopup = e => {
		e.cancelBubble = true;
		console.log(this.attachPopup);
		this.attachPopup.classList.toggle('popup_hidden');
		this.attachMedia.classList.toggle('icon_active');
	};

	sendMedia = e => {
		this.mediaDrop.classList.remove('hide');
	};

	sendMessage = e => {
		console.log('Sending message', this.value);
		const id = getActivePeerId();
		telegramApi.sendMessage(id, this.value).then(res => {
			console.log(res);
			telegramApi.AppUpdatesManager.passUpdate(res);
		});
		this.inputArea.innerHTML = '';
	};

	showEmoji = e => {
		e.target.style.fill = 'red';
	};

	hideEmoji = e => {
		setTimeout(() => {
			e.target.style.fill = 'gray';
		}, 500);
	};

	inputHandler = e => {
		const inputSymbol = e.data;
		if (this.inputArea.textContent != '') {
			this.nonemptyInputHandler();
		} else {
			this.emptyInputHandler();
		}
		this.value += inputSymbol == null ? '' : inputSymbol;
	};

	nonemptyInputHandler = () => {
		this.inputArea.setAttribute('placeholder', '');
		this.sendButton.className = 'send-arrow';
	};

	emptyInputHandler = () => {
		this.inputArea.setAttribute('placeholder', 'Message');
		this.sendButton.className = 'microphone';
	};

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
