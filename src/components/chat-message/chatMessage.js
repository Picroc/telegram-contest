import makeTemplate from './chat-message.html';
import { getMessage, getActivePeerId, getUser, getActivePeer } from '../../store/store';
import './chatMessage.scss';
import { clsx, tc, htmlToElement } from '../../helpers/index';
import { telegramApi } from '../../App';

export default class ChatMessage extends HTMLElement {
	render = async () => {
		const peerId = getActivePeerId();
		const { _: type } = getActivePeer();
		const messageId = this.getAttribute('id');
		const message = getMessage(peerId)(messageId);
		const { from_id, media, flags, date, _: messageType } = message;
		const { out, channel_post: post, ...pflags } = telegramApi._checkMessageFlags(flags);
		const withAvatar = !out && !(type === 'peerUser' || post || messageType === 'messageService');
		this.className = clsx(
			'chat-message',
			tc('chat-message_out', 'chat-message_in', out),
			post && 'chat-message_post',
			media && 'chat-message_full-media',
			withAvatar && 'chat-message_with_avatar',
			!message.message && 'chat-message_without_message'
			// out && 'chat-message_post_out_last',
			// !out && 'chat-message_post_in_last'
		);
		let time = new Date(date * 1000);
		time = `${time.getHours()}:${time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes()}`;
		this.innerHTML = `${makeTemplate({ ...message, ...pflags, time, withAvatar })}`;
		const avatar = await telegramApi.getPeerPhoto(from_id).catch(err => {
			console.log('SOME ERR', err, from_id, message, post);
		});
		if (withAvatar) {
			this.prepend(htmlToElement(`<img class="chat-message__avatar avatar avatar_small" src=${avatar}></img>`));
		}
	};

	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return [];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}
}
