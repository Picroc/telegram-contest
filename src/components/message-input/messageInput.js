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
		this.mediaDropAccept = this.mediaDrop.querySelector('.media-drop__accept-button');
		this.mediaDropPlace = this.mediaDrop.querySelector('.media-drop__media-place');
		this.mediaDropCaption = this.mediaDrop.querySelector('.media-drop__caption');
		this.mediaDropExit.addEventListener('click', this.closeMediaDrop);
		this.mediaDrop.addEventListener('click', this.closeMediaDrop);
		this.mediaDropPane = this.querySelector('.media-drop__pane');
		this.mediaDropPane.addEventListener('click', e => (e.cancelBubble = true));

		this.sendFilePopupBtn = this.querySelector('.attach-media__document');
		this.sendFilePopupBtn.addEventListener('click', this.showFileDrop);

		this.fileDrop = this.querySelector('.file-drop__paranja');
		this.fileDropExit = this.fileDrop.querySelector('.file-drop__close-button');
		this.fileDropPlace = this.fileDrop.querySelector('.file-drop__file-place');
		this.fileDropCaption = this.fileDrop.querySelector('.file-drop__caption');
		this.fileDropAccept = this.fileDrop.querySelector('.file-drop__accept-button');
		this.fileDropExit.addEventListener('click', this.closeFileDrop);
		this.fileDrop.addEventListener('click', this.closeFileDrop);
		this.fileDropPane = this.querySelector('.file-drop__pane');
		this.fileDropPane.addEventListener('click', e => (e.cancelBubble = true));

		const dragPrevent = e => {
			e.stopPropagation();
			e.preventDefault();
		};

		this.fileDropPane.addEventListener('dragenter', dragPrevent, false);
		this.fileDropPane.addEventListener('dragover', dragPrevent, false);
		this.mediaDropPane.addEventListener('dragenter', dragPrevent, false);
		this.mediaDropPane.addEventListener('dragover', dragPrevent, false);

		this.fileDropPane.addEventListener('drop', this.handleDrop);
		this.mediaDropPane.addEventListener('drop', this.handleDrop);

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

	handleDrop = e => {
		e.stopPropagation();
		e.preventDefault();

		const transfer = e.dataTransfer;
		const file = transfer.files[0];

		if (file && e.target.classList.contains('file-drop__pane')) {
			if (transfer.files.length > 1) {
				this.handleFiles(Array.from(transfer.files));
			} else {
				this.handleFile(file);
			}
		} else {
			if (transfer.files.length > 1) {
				this.handlePhotos(Array.from(transfer.files));
			} else {
				this.handlePhoto(file);
			}
		}
	};

	handleFile = file => {
		if (file) {
			this.showFile(file);
			this.fileDropAccept.addEventListener('click', () => this.uploadFile(file));
		}
	};

	handleFiles = (files = []) => {
		if (files) {
			files.forEach(file => {
				this.handleFile(file);
			});
			// this.fileDropAccept.addEventListener('click', () => this.uploadFiles(files));
		}
	};

	handlePhoto = file => {
		if (file) {
			this.showPhoto(file);
			this.mediaDropAccept.addEventListener('click', () => this.uploadPhoto(file));
		}
	};

	handlePhotos = (files = []) => {
		if (files) {
			files.forEach(file => {
				this.handlePhoto(file);
			});
			// this.mediaDropAccept.addEventListener('click', () => this.uploadPhotos(files));
		}
	};

	showFile = file => {
		this.fileDropPlace.style = 'display: hidden';

		this.fileDropPlace.append(htmlToElement(`<div>DOC ICON | ${file.type.split('/')[1]} | ${file.name}</div>`));
	};

	showPhoto = file => {
		const image = document.createElement('img');

		image.style = 'width: 160px; height: 160px;';

		image.src = window.URL.createObjectURL(new Blob([file]));

		this.mediaDropPane.append(image);
	};

	uploadFile = file => {
		if (file) {
			telegramApi
				.sendFile(
					{ file, id: getActivePeerId(), caption: this.fileDropCaption.value },
					'',
					this.progressHandler
				)
				.then(this.closeFileDrop);
		}
	};

	uploadPhoto = file => {
		if (file) {
			telegramApi
				.sendFile(
					{ file, id: getActivePeerId(), caption: this.mediaDropCaption.value },
					'inputMediaUploadedPhoto',
					this.progressHandler
				)
				.then(this.closeMediaDrop);
		}
	};

	uploadFiles = (files = []) => {
		const data = files.map(file => ({
			file: file,
			caption: this.fileDropCaption.value,
		}));

		telegramApi.sendMultiFile({ id: getActivePeerId(), data }, '', this.progressHandler).then(this.closeFileDrop);
	};

	uploadPhotos = (files = []) => {
		const data = files.map(file => ({
			file: file,
			caption: this.fileDropCaption.value,
		}));

		telegramApi
			.sendMultiFile({ id: getActivePeerId(), data }, 'inputMediaUploadedPhoto', this.progressHandler)
			.then(this.closeFileDrop);
	};

	uploadPhotos = (files = []) => {};

	progressHandler = (current, all) => {
		console.log('Uploading file', (current / all) * 100);
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
		const id = getActivePeerId();
		telegramApi.sendMessage(id, this.value).then(res => {
			telegramApi.AppUpdatesManager.passUpdate(res);
		});
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
