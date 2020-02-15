import forward from './forward.svg';
import channelViews from './channel-views.svg';
import checkRead from './check-read.svg';
import checkSent from './check-sent.svg';
import sending from './sending.svg';
import sendingError from './sending-error.svg';
import { clsx, tc, cc } from '../../helpers';
import { telegramApi } from '../../App';
import { outSvg, outNotReadSvg } from '../user-dialogs/dialog/dialog.html';
import { startLoading, stopLoading, sanitize } from '../../helpers/index';

export default ({
	id,
	time,
	toId,
	userId,
	message,
	views = 0,
	media = null,
	entities = null,
	out = false,
	outRead = false,
	post = false,
	silent = false,
	mentioned = false,
	isChannel = false,
	isLastFromUser = false,
	from_id: fromId = 0,
	edit_date: editDate = 0,
	via_bot_id: viaBotId = 0,
	grouped_id: groupedId = 0,
	reply_to_msg_id: replyToMessageId = 0,
	fwd_from: forwardFrom = null,
	reply_markup: replyMarkup = null,
	restriction_reason: restrictionReason = null,
	media_unread: mediaUnread = false,
	from_scheduled: fromScheduled = false,
	post_author: postAuthor = '',
}) => {
	const hasMedia = !!media;
	const outIcon = out ? (outRead ? outSvg : outNotReadSvg) : '';

	let photoMedia = '';
	if (hasMedia) {
		const fullMessageMedia = getFullMessageMediaTemplate(media, id);
		if (fullMessageMedia.length !== 0) {
			return `
                ${fullMessageMedia}
                `;
		}
		const { _: mediaType, photo = {}, photos = [] } = media;
		const messageInfo = !message
			? `<div class="${clsx(
				'message__info',
				!message && hasMedia && 'message__info_media_no-message'
			)}">${time}${outIcon}</div>`
			: '';

		if (mediaType === 'messageMediaPhoto') {
			const photoElemList = photos.reduce((accum, currentPhoto) => (accum += getPhotoTemplate(currentPhoto)), ``);
			const photoElem = getPhotoTemplate(photo);
			const photoCls = clsx('chat-message__photo-media', message && 'chat-message__photo-media_with_message');

			photoMedia = `<div class="${photoCls}">${photoElemList || photoElem} ${messageInfo} </div>`;
		}
		// TODO implement logic for messageMediaWebPage
	}

	const forward = (forwardFrom && `<div>Was forwarded from ${forwardFrom}</div>`) || '';
	const reply =
		(replyToMessageId && `<div class="chat-message__reply" id='chat-message__reply_${replyToMessageId}'></div>`) ||
		'';
	if (replyToMessageId) {
		setZeroTimeout(async () => {
			const reply_elem = document.getElementById(`chat-message__reply_${replyToMessageId}`);
			if (reply_elem) {
				const results = await telegramApi.getReplyInfo(replyToMessageId);
				reply_elem.innerHTML = `<div class='reply-field'><div class="reply-field__title">${results.title ||
					(results.document && results.document.filename) ||
					'Document'}</div>${results.message || ''}</div>`;
				// console.log('REPLY', results);
			}
		});
	}

	const formattedMessage = getFormattedMessage({ message, entities, time, outIcon });

	// TODO add handlers for reply & message
	return `
            ${reply}
            ${photoMedia}
			${formattedMessage}
        `;
};

const getFullMessageMediaTemplate = ({ _: mediaType }, messageId) => {
	switch (mediaType) {
		case 'messageMediaDocument':
			return `<document-message id="${messageId}"/>`;
		case 'messageMediaGeo':
			return `<geo-message id="${messageId}"/>`;
		case 'messageMediaGeoLive':
			return `<geo-live-message id="${messageId}"/>`;
		case 'messageMediaContact':
			return `<contact-message id="${messageId}"/>`;
		case 'messageMediaGame':
			return `<game-message id="${messageId}"/>`;
		case 'messageMediaInvoice':
			return `<invoice-message id="${messageId}"/>`;
		case 'messageMediaPoll':
			return `<poll-message id="${messageId}"/>`;
		case 'messageMediaUnsupported':
			return `<div class="chat-message_media-unsupported">
                        Sorry, this message is not supported by your version of Web Telegram.
                        Maybe we will fix it later</div>`;
		default:
			return ``;
	}
};

const getPhotoTemplate = photo => {
	const {
		id,
		date,
		sizes,
		dc_id: dcId,
		access_hash: accessHash,
		file_reference: fileReference,
		has_stickers: hasStickers = false,
	} = photo;
	const [strippedSize, normalSize, ...largeSizes] = sizes;
	const { w: width, h: height } = normalSize;

	setZeroTimeout(() => {
		startLoading(document.getElementById(id));
		telegramApi.getPhotoPreview(photo).then(data => {
			const container = document.getElementById(id);
			if (!container) {
				return;
			}
			const img = document.createElement('img');
			img.style = 'width: 100%; height: 100%';
			img.src = data;

			stopLoading(container);
			container.innerHTML = '';
			container.appendChild(img);
			container.classList.add('size_normal');
		});
	});
	return `<div id="${id}" style="width: ${width}px;height: ${height}px;background: #fafafa"></div>`;
	// TODO implement logic for all other sizes
};

// TODO implement formatted message
const getFormattedMessage = ({ message, entities = [], time, outIcon }) => {
	if (!message) {
		return '';
	}
	if (isEmoji(message)) {
		return `<div class="chat-message_emoji">${sanitize(message)}</div>`;
	}

	let formatted = sanitize(message);

	entities &&
		entities.reverse().forEach(entity => {
			if (entity._ === 'messageEntityUrl') {
				const pre = formatted.slice(0, entity.offset);
				const msg_ent = formatted.slice(entity.offset, entity.offset + entity.length);
				const pos = formatted.slice(entity.offset + entity.length);
				formatted = `${pre}<a href='${msg_ent}'>${msg_ent}</a>${pos}`;
			}
		});

	const messageInfo = `<div class="${clsx(
		'message__info',
		!message && hasMedia && 'message__info_media_no-message'
	)}">${time}${outIcon}</div>`;
	return (message && `<div class="message">${formatted} ${messageInfo}</div>`) || '';
};

const isEmoji = message => {
	const emojiRegEx = /^[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]$/gu;
	return message.length < 6 && emojiRegEx.test(message);
};
