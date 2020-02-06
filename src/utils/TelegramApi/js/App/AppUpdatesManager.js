import MtpNetworkerFactoryModule from '../Mtp/MtpNetworkerFactory';
import { telegramApi } from '../../../../App';
import { Config } from '../lib/config';
import { dT } from '../lib/utils';

export default class AppUpdatesManagerModule {
	subscribed = {
		status: [],
		messages: [],
		misc: [],
		dialogs: [],
	};

	MtpNetworkerFactory = MtpNetworkerFactoryModule();

	_checkFlag = (flags, idx) => {
		return (flags & (2 ** idx)) === 2 ** idx;
	};

	_checkMessageFlags = msg_flags => ({
		out: this._checkFlag(msg_flags, 1),
		mentioned: this._checkFlag(msg_flags, 4),
		media_unread: this._checkFlag(msg_flags, 5),
		muted: this._checkFlag(msg_flags, 13),
		channel_post: this._checkFlag(msg_flags, 14),
		scheduled: this._checkFlag(msg_flags, 18),
		legacy: this._checkFlag(msg_flags, 19),
		hide_edit: this._checkFlag(msg_flags, 21),
	});

	constructor() {
		const updatesHandler = data => {
			// console.log('Got event', data);
			if (data._ === 'updateShort' || data._ === 'updates') {
				this._parseUpdate(data);
			} else if (data._ === 'updateShortMessage' || data._ === 'updateShortChatMessage') {
				this._parseUpdate({ update: data });
			}
		};

		this.MtpNetworkerFactory.subscribe('updateHandler', updatesHandler);
	}

	subscribe = (type, handler) => {
		if (!type || !this.subscribed[type] || typeof handler !== 'function') {
			return;
		}

		this.subscribed[type].push(handler);
	};

	_parseUpdate = data => {
		// console.log('Got update!', data);
		const switchUpdate = update => {
			switch (update._) {
				case 'updateNewMessage':
				case 'updateNewChannelMessage':
				case 'updateNewEncryptedMessage':
				case 'updateNewScheduledMessage':
					this._handleNewMessage(update, data);
					break;
				case 'updateShortChatMessage':
					this._handleNewChatMessage(update);
					break;
				case 'updateShortMessage':
					this._handleNewUserMessage(update);
					break;
				case 'updateUserStatus':
					// console.log(telegramApi.AppUsersManager.getUser(update.user_id));
					break;
				default:
			}
		};
		if (data.updates) {
			data.updates.forEach(switchUpdate);
		} else {
			switchUpdate(data.update);
		}
	};

	_handleNewUserMessage = async message => {};

	_handleNewChatMessage = async message => {
		const { from_id, chat_id, message: text, date, id, flags } = message;

		const payload = {
			_: 'newMessage',
			from_id,
			to_id: chat_id,
			date,
			message: text,
			id,
			message_info: this._checkMessageFlags(flags),
		};

		this._dispatchForDialogs(payload);
		this._dispatchForMessages(payload);
	};

	_handleNewUserMessage = async message => {
		const { user_id, message: text, date, id, flags } = message;

		const payload = {
			_: 'newMessage',
			from_id: user_id,
			date,
			message: text,
			id,
			message_info: this._checkMessageFlags(flags),
		};

		this._dispatchForDialogs(payload);
		this._dispatchForMessages(payload);
	};

	_handleNewMessage = update => {
		// console.log('Got new message! ', update, data);

		const message = update.message;

		const from_id = message.from_id;

		const to_id = message.to_id.user_id || message.to_id.chat_id || message.to_id.channel_id;

		const payload = {
			_: 'newMessage',
			from_id,
			to_id,
			message: message.message,
			message_info: this._checkMessageFlags(message.flags),
			date: message.date,
			id: message.id,
		};

		// console.log(payload);

		this._dispatchForDialogs(payload);
		this._dispatchForMessages(payload);
	};

	_dispatchEvent = (handler, payload) => {
		handler(payload);
	};

	_dispatchForDialogs = payload => {
		this.subscribed.dialogs.forEach(el => this._dispatchEvent(el, payload));
	};

	_dispatchForMessages = payload => {
		this.subscribed.messages.forEach(el => this._dispatchEvent(el, payload));
	};
}
