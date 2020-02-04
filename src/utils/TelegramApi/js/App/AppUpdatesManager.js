import MtpNetworkerFactoryModule from '../Mtp/MtpNetworkerFactory';

export default class AppUpdatesManagerModule {
	subscribed = {
		status: [],
		messages: [],
		misc: [],
		dialogs: [],
	};

	MtpNetworkerFactory = MtpNetworkerFactoryModule();

	constructor() {
		const updatesHandler = data => {
			if (data._ === 'updateShort' || data._ === 'updates') {
				this._parseUpdate(data);
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
				default:
			}
		};
		if (data.updates) {
			data.updates.forEach(switchUpdate);
		} else {
			switchUpdate(data.update);
		}
	};

	_handleNewMessage = (update, data) => {
		// console.log('Got new message! ', update, data);

		const message = update.message;

		const from_id = message.from_id;
		const from_peer =
			data.users.filter(user => user.id === from_id)[0] || data.chats.filter(chat => chat.id === from_id)[0];

		const to_id = message.to_id.user_id || message.to_id.chat_id || message.to_id.channel_id;
		const to_peer =
			message.to_id._ === 'peerChannel' || message.to_id._ === 'peerChat'
				? data.chats.filter(chat => chat.id === to_id)[0]
				: data.users.filter(user => user.id === to_id)[0];

		const payload = {
			from_peer,
			to_peer,
			message: message.message,
			date: message.date,
		};

		console.log(payload);

		this.subscribed.dialogs.forEach(el => this._dispatchEvent(el, payload));
		this.subscribed.messages.forEach(el => this._dispatchEvent(el, payload));
	};

	_dispatchEvent = (handler, payload) => {
		handler(payload);
	};
}
