import lottie from 'lottie-web';
import { getActivePeerId, getMessage } from '../../../store/store';
import { createDiv, createElement } from '../../../helpers';
import { telegramApi } from '../../../App';

export default class DocumentMessage extends HTMLElement {
	constructor() {
		super();
		this.id = this.getAttribute('id');
		this.peerId = getActivePeerId();
	}

	render() {
		const {
			media: { document },
		} = getMessage(this.peerId)(this.id);
		this.innerHTML = `<div class="document-message">${this.getContentByMimeType(document)}</div>`;
	}

	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return [];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	getContentByMimeType(document) {
		switch (document.mime_type) {
			case 'application/x-tgsticker':
				return this.getAnimatedSticker(document);
			case 'image/webp':
				return this.getSticker(document);
			case 'video/mp4':
				return this.getVideoDocument(document);
			default:
				console.log('UNDEFINED', document);
				'DOCUMENT';
		}
	}

	getVideoDocument(doc) {
		console.log(doc);
		telegramApi.downloadDocument(doc).then(data => {
			console.log(data);
			telegramApi._getVideoData(data.bytes).then(video_data => {
				const vid = document.createElement('video');
				vid.src = video_data;
				vid.width = 300;
				vid.height = 300;
				vid.controls = 'controls';
				vid.autoplay = true;
				this.querySelector('.document-message__video').appendChild(vid);
			});
		});
		return `<div style='width: 300px; height: 300px;' class='document-message__video'></div>`;
	}

	getAnimatedSticker(doc) {
		const { id, file_reference: fileReference, date, size, thumbs, attributes } = doc;
		const { type, w, h, bytes } = thumbs[0];
		const [{ w: width, h: height }, { alt: altEmoji, stickerset: stickerSet }] = attributes;
		const stickerPreviewUrl = `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
		telegramApi.downloadDocument(doc).then(data => {
			telegramApi.setStickerToContainer(data, this.querySelector(`.chat-message_animated-sticker`));
			this.querySelector('.chat-message_animated-sticker img').remove();
		});
		return `<div class="chat-message_animated-sticker"><img src="${stickerPreviewUrl}" alt=${altEmoji}></div>`;
	}

	getSticker({ id, file_reference: fileReference, date, size, thumbs, attributes }) {
		const { type, w, h, bytes } = thumbs[0];
		const [
			{ w: width, h: height },
			{ alt: altEmoji, stickerset: stickerSet },
			{ file_name: fileName },
		] = attributes;
		const stickerUrl = `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
		console.log('sticker', altEmoji, thumbs, btoa(String.fromCharCode(...new Uint8Array(bytes))));
		return `<div class="chat-message_sticker"><img src="${stickerUrl}" alt=${altEmoji}></div>`;
	}

	getAnimationItem = (data, options) => () =>
		lottie.loadAnimation({
			container: this,
			renderer: 'svg',
			loop: options.loop || false,
			autoplay: options.auto || false,
			animationData: data,
		});
}
