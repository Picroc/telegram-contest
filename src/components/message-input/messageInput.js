import template from './message-input.html';
import microphoneSvg from './microphone.svg';
import attachSvg from './attach';
import emojiSvg from './emoji';
import sendArrow from './sendArrow.svg';
import './mediaDrop.scss';
import './messageInput.scss';
import { setInnerHTML, setAttribute, htmlToElement, capitalise } from '../../helpers/index';
import { telegramApi } from '../../App';
import { getActivePeerId } from '../../store/store';

export default class MessageInput extends HTMLElement {
	render() {
		this.innerHTML = template;
		window.updateRipple();
		const setHTML = setInnerHTML.bind(this);

		setHTML('.attach-media')(attachSvg());
		this.attachMedia = this.querySelector('.attach-media');
		this.attachPopup = this.querySelector('.attach-media__popup');
		this.attachMedia.addEventListener('click', this.showAttachPopup);

		this.sendMediaPopupBtn = this.querySelector('.attach-media__media');
		this.sendMediaPopupBtn.addEventListener('click', this.showMediaDrop);

		this.mediaDrop = this.querySelector('.media-drop__paranja');
		this.mediaDropExit = this.mediaDrop.querySelector('.media-drop__close-button');
		this.mediaDropExit.addEventListener('click', this.closeMediaDrop);
		this.mediaDrop.addEventListener('click', this.closeMediaDrop);
		this.mediaDropPane = this.querySelector('.media-drop__pane');
		this.mediaDropPane.addEventListener('click', e => (e.cancelBubble = true));

		this.sendFilePopupBtn = this.querySelector('.attach-media__document');
		this.sendFilePopupBtn.addEventListener('click', this.showFileDrop);

		this.fileDrop = this.querySelector('.file-drop__paranja');
		this.fileDropExit = this.fileDrop.querySelector('.file-drop__close-button');
		this.fileDropExit.addEventListener('click', this.closeFileDrop);
		this.fileDrop.addEventListener('click', this.closeFileDrop);
		this.fileDropPane = this.querySelector('.file-drop__pane');
		this.fileDropPane.addEventListener('click', e => (e.cancelBubble = true));

		this.inputArea = this.querySelector('.text-input__input');
		this.inputArea.addEventListener('input', this.inputHandler);
		this.inputArea.addEventListener('keyup', this.handleButton);

		setHTML('.emoji-set')(emojiSvg());
		this.emoji = this.querySelector('.emoji-set');
		this.emoji.addEventListener('mouseover', this.showEmoji);
		this.emoji.addEventListener('mouseout', this.hideEmoji);
		this.emojiPopup = this.querySelector('.emoji__popup');
		this.emojiPopup.addEventListener('click', e => (e.cancelBubble = true));
		this.tabs = this.querySelector('.popup__tabs');
		this.loadTabs(['emoji', 'stickers', 'GIFs']);

		this.value = '';
		this.sendButton = this.querySelector('#send-button');
		this.sendButton.addEventListener('click', this.sendMessage);
	}

	loadTabs = tabs => {
		tabs.map(tab => {
			const tabElem = this.createTabElem(tab);
			tabElem.addEventListener('click', this.chooseTab);
			this.tabs.append(tabElem);
		});
		this.tabs.firstChild.classList.add('tab_active');
		this.underline = htmlToElement(`<div class="tabs__underline underline" id="popup_underline"></div>`);
		this.tabs.append(this.underline);
		this.tabs.append(htmlToElement(`<div class="tabs__gray-line gray-line" id="popup_gray-line"></div>`));
	};

	createTabElem = tab => {
		return htmlToElement(`
        <div class="tabs__tab tab tab__${tab}" id="tab_${tab}">${capitalise(tab)}</div>`);
	};

	chooseTab = e => {
		Array.from(this.tabs.childNodes).forEach((element, index) => {
			if (element.id !== 'underline' && element.id !== 'gray-line') {
				const tabName = element.id.split('_')[1];
				console.log('tabName', tabName);
				const assosiatedEmojiElem = this.querySelector(`.tabs__content_${tabName}`);
				if (element == e.target) {
					e.target.classList.add('tab_active');
					assosiatedEmojiElem.classList.remove('hide');
					this.underline.style.transform = 'translateX(' + index * 220 + '%)';
				} else {
					element.classList.remove('tab_active');
					assosiatedEmojiElem.classList.add('hide');
				}
			}
		});
	};

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

	showMediaDrop = e => {
		this.mediaDrop.classList.remove('hide');
	};

	closeMediaDrop = () => {
		this.mediaDrop.classList.add('hide');
	};

	showFileDrop = e => {
		this.fileDrop.classList.remove('hide');
	};

	closeFileDrop = () => {
		this.fileDrop.classList.add('hide');
	};

	sendMessage = e => {
		console.log('Sending message', this.value);
		const id = getActivePeerId();
		telegramApi.sendMessage(id, this.value);
		this.value = '';
		this.inputArea.innerHTML = '';
	};

	showEmoji = e => {
		e.target.style.fill = 'var(--primary)';
		this.emojiPopup.classList.remove('popup_hidden');
	};

	hideEmoji = e => {
		// setTimeout(() => {//interval?
		// 	e.target.style.fill = 'gray';
		// 	this.emojiPopup.classList.add('popup_hidden');
		// }, 500);
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
