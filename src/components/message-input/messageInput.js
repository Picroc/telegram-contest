import template from './message-input.html';
import microphoneSvg from './microphone.svg';
import attachSvg from './attach';
import emojiSvg from './emoji';
import sendArrow from './sendArrow.svg';
import './mediaDrop.scss';
import './messageInput.scss';
import { setInnerHTML, setAttribute, htmlToElement, capitalise, createDiv } from '../../helpers/index';
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
		this.emoji.addEventListener('click', this.toggleEmoji);
		this.emojiPopup = this.querySelector('.emoji__popup');
		this.emojiPopup.addEventListener('click', e => (e.cancelBubble = true));
		this.tabs = this.querySelector('.popup__tabs');
		this.tabsContent = this.querySelector('.tabs__content');

		this.activeTab = 'emoji';
		this.loadTabs(['emoji', 'stickers', 'GIFs']);

		this.emojiContent = this.querySelector('.emoji__content');
		this.fillEmojiContent();

		this.sendButton = this.querySelector('#send-button');
		this.sendButton.addEventListener('click', this.sendMessage);
	}

	fillEmojiContent = () => {
		const initialEmojiNum = 128512;
		const emojiAmount = 80; //mb change later
		for (let i = 0; i < emojiAmount; i++) {
			const currentEmojiNum = initialEmojiNum + i;
			const div = createDiv(`emoji_element emoji_${currentEmojiNum}`);
			const emoji = String.fromCodePoint(currentEmojiNum);
			div.innerHTML = emoji; //vi tolko glyante na etot govnokod
			div.addEventListener('click', () => {
				if (
					this.inputArea.innerHTML.slice(
						this.inputArea.innerHTML.length - 8,
						this.inputArea.innerHTML.length
					) == '<br><br>'
				) {
					this.inputArea.innerHTML = this.inputArea.innerHTML.slice(0, this.inputArea.innerHTML.length - 4);
				}
				this.inputArea.innerHTML += emoji;
				this.inputHandler({ data: emoji });
			});
			this.emojiContent.append(div);
		}
		//codePointAt, fromCodePoint
		//'\u{1F600}'
	};

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
				const assosiatedEmojiElem = this.querySelector(`.tabs__content_${tabName}`);
				if (element == e.target) {
					e.target.classList.add('tab_active');
					assosiatedEmojiElem.classList.remove('hide');
					this.underline.style.transform = 'translateX(' + index * 220 + '%)';
				} else {
					element.classList.remove('tab_active');
					assosiatedEmojiElem && assosiatedEmojiElem.classList.add('hide');
				}
			}
		});
	};

	showAttachPopup = e => {
		e.cancelBubble = true;
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
		if (this.inputArea.textContent != '') {
			const result = this.inputArea.innerHTML
				.replace('&nbsp;', ' ')
				.replace(/<br>/g, '\n')
				.replace('<div>\n</div>', '');
			console.log('Sending message', result);
			const id = getActivePeerId();
			telegramApi.sendMessage(id, result).then(res => {
				console.log(res);
				telegramApi.AppUpdatesManager.passUpdate(res);
			});
			this.inputArea.innerHTML = '';
		} else {
			this.inputArea.innerHTML = '';
			this.emptyInputHandler();
			console.log('Empty message, did not sent');
		}
	};

	toggleEmoji = e => {
		e.cancelBubble = true;
		this.emoji.classList.toggle('icon_active');
		this.emojiPopup.classList.toggle('popup_hidden');
	};

	handleButton = e => {
		if (e.shiftKey && e.code == 'Enter') {
			// hello
		} else if (e.code == 'Enter') {
			e.cancelBubble = true;
			document.execCommand('insertHTML', false, '');
			e.preventDefault();
			this.sendMessage('Enter');
		}
	};

	inputHandler = e => {
		if (this.inputArea.innerHTML == '<br>') {
			this.inputArea.innerHTML = '';
		}
		if (this.inputArea.innerHTML != '') {
			this.nonemptyInputHandler();
		} else {
			this.emptyInputHandler();
		}
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
