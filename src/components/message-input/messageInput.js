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
		this.id = 'message-input';
		window.updateRipple();
		const setHTML = setInnerHTML.bind(this);

		setHTML('.attach-media')(attachSvg());
		this.attachMedia = this.querySelector('.attach-media');
		this.attachPopup = this.querySelector('.attach-media__popup');
		this.attachMedia.addEventListener('click', this.showAttachPopup);
		this.eventListenters = [];

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
		// this.mediaDropPane.addEventListener('dragenter', dragPrevent, false);
		this.mediaDropPane.addEventListener('dragover', dragPrevent, false);

		this.fileDropPane.addEventListener('drop', this.handleDrop);
		this.mediaDropPane.addEventListener('drop', this.handleDrop);
		this.dataCounter = 0;

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

		this.stickers = this.querySelector('.tabs__content_stickers');
	}

	getStickers = () => {
		const chatPage = document.getElementById('chat-page');
		if (!chatPage.stickers) {
			telegramApi.getAllStickersParsed().then(stickerpacksArray =>
				stickerpacksArray[0].then(stickerpack => {
					chatPage.stickers = stickerpack;
					stickerpack.stickers.forEach(stickerPromise => {
						stickerPromise().then(sticker => {
							const div = createDiv(`sticker_element stickerpack_${stickerpack.id}`);
							div.addEventListener('click', this.sendSticker);
							this.stickers.append(div);
							telegramApi.setStickerToContainer(sticker, div, stickerpack.id);
						});
					});
				})
			);
		} else {
			chatPage.stickers.forEach(stickerPromise => {
				stickerPromise().then(sticker => {
					const div = createDiv(`sticker_element stickerpack_${stickerpack.id}`);
					div.addEventListener('click', this.sendSticker);
					this.stickers.append(div);
					telegramApi.setStickerToContainer(sticker, div, stickerpack.id);
				});
			});
		}
	};

	sendSticker = e => {
		//not implemented
	};

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
		if (file && e.target.classList.contains('file-drop__file-place')) {
			if (transfer.files.length > 1) {
				this.handleFiles(Array.from(transfer.files));
			} else {
				this.handleFile(file);
			}
			this.handeDroppedElemets('file');
		} else {
			if (transfer.files.length > 1) {
				this.handlePhotos(Array.from(transfer.files));
			} else {
				console.log('!!!');

				this.handlePhoto(file);
			}
			this.handeDroppedElemets('photo');
		}
	};

	handeDroppedElemets = type => {
		console.log('this.dataCounter', this.dataCounter);
		let pane;
		let keyword;
		switch (type) {
			case 'file':
				pane = this.querySelector('.file-drop__pane');
				keyword = 'Files';
				break;
			case 'photo':
				pane = this.querySelector('.media-drop__pane');
				keyword = 'Photos';
				break;
		}
		const dropPlace = pane.querySelector('.drop-place');
		if (this.dataCounter == 0) {
			dropPlace.innerHTML = '';
			keyword = keyword.slice(0, -1);
		}
		this.dataCounter = this.dataCounter + 1;
		const droppedElem = pane.querySelector('.dropped_elem');
		console.log('droppedElem', droppedElem);
		droppedElem.className = '';
		const text = pane.querySelector('.text');
		dropPlace.appendChild(droppedElem);
		text.innerHTML = `Send ${this.dataCounter} ${keyword}`;
	};

	handleFile = file => {
		let listener;
		if (file) {
			listener = this.uploadFile(file);
			this.showFile(file);
			this.fileDropAccept.addEventListener('click', listener);
		}
		this.eventListenters.push(listener);
	};

	handleFiles = (files = []) => {
		if (files) {
			files.forEach(file => {
				this.handleFile(file);
			});
		}
	};

	handlePhoto = file => {
		let listener;
		if (file) {
			listener = this.uploadPhoto(file);
			this.showPhoto(file);
			this.mediaDropAccept.addEventListener('click', listener);
		}
		this.eventListenters.push(listener);
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
		// this.fileDropPlace.style = 'display: hidden';
		this.fileDropPane.append(
			htmlToElement(`<div class='dropped_elem'>  DOC ICON | ${file.type.split('/')[1]} | ${file.name}</div>`)
		);
	};

	showPhoto = file => {
		const image = document.createElement('img');

		// image.style = 'width: 160px; height: 160px;';
		image.className = 'dropped_elem';

		image.src = window.URL.createObjectURL(new Blob([file]));

		this.mediaDropPane.append(image);
	};

	uploadFile = file => () => {
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

	uploadPhoto = file => () => {
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

	uploadPhotos = (files = []) => { };

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
		const textElem = document.querySelector('.media-drop__text');
		console.log('textElem', textElem);
		textElem.innerHTML = 'Drag to Reposition';
		this.mediaDropPlace.innerHTML = 'Drag and Drop media here to send it...';
		this.mediaDropCaption.value = '';
		this.dataCounter = 0;
		console.log('this.dataCounter', this.dataCounter);
		this.eventListenters.forEach(listener => {
			this.mediaDropAccept.removeEventListener('click', listener);
		});
		this.eventListenters = [];
	};

	showFileDrop = e => {
		this.fileDrop.classList.remove('hide');
	};

	closeFileDrop = () => {
		this.fileDrop.classList.add('hide');
		const textElem = document.querySelector('.file-drop__text');
		console.log('textElem', textElem);
		textElem.innerHTML = 'Drag to Reposition';
		this.fileDropPlace.innerHTML = 'Drag and Drop file here to send it...';
		this.fileDropCaption.value = '';
		this.dataCounter = 0;
		console.log('this.dataCounter', this.dataCounter);
		this.eventListenters.forEach(listener => {
			this.fileDropAccept.removeEventListener('click', listener);
		});
		this.eventListenters = [];
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
		} else {
			console.log('Empty message, did not sent');
		}

		this.inputArea.innerHTML = '';
		this.emptyInputHandler();
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
