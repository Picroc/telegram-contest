import lottie from 'lottie-web';
import { getActivePeerId, getMessage } from '../../../store/store';
import { telegramApi } from '../../../App';
import { startLoadingProgress, setLoadingProgress, stopLoadingProgress } from '../../../helpers/index';

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
		this.addEventListener('click', () => {
			if (!this.loading) {
				this.loading = true;
			} else {
				return;
			}

			const videoPlaceholder = this.querySelector('.document-message__video');
			const handleProgress = (offset, size) => {
				setLoadingProgress(videoPlaceholder, (offset / size) * 100);
			};

			startLoadingProgress(videoPlaceholder);
			telegramApi.downloadDocument(doc, handleProgress).then(data => {
				console.log(data);
				telegramApi._getVideoData(data.bytes).then(video_data => {
					const vid = document.createElement('video');
					vid.src = video_data;
					vid.width = 300;
					vid.height = 300;
					vid.controls = 'controls';
					vid.autoplay = true;
					stopLoadingProgress(videoPlaceholder);
					videoPlaceholder.appendChild(vid);
				});
			});
		});
		return `<div style='width: 300px; height: 300px;background: url("https://riggswealth.com/wp-content/uploads/2016/06/Riggs-Video-Placeholder.jpg"); background-position: center center;' class='document-message__video'></div>`;
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

	getSticker({ id, access_hash, file_reference: fileReference, date, size, thumbs, attributes }) {
		const { type, w, h, bytes } = thumbs[0];
		const [
			{ w: width, h: height },
			{ alt: altEmoji, stickerset: stickerSet },
			{ file_name: fileName },
		] = attributes;
		const stickerUrl = window.URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
		if (!bytes) {
			telegramApi.getDocumentPreview({ id, file_reference: fileReference, access_hash, thumbs }).then(res => {
				const img = document.createElement('img');
				img.src = window.URL.createObjectURL(new Blob([res.bytes], { type: 'image/png' }));
				img.style = 'width: 100%; height: 100%';

				this.querySelector('.chat-message_sticker').appendChild(img);
			});
		}
		console.log('sticker', altEmoji, thumbs);
		return `<div id='${id}' style='width: 120px; height: 120px;' class="chat-message_sticker">${
			bytes ? `<img src="${stickerUrl}" alt=${altEmoji}>` : ''
		}</div>`;
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
