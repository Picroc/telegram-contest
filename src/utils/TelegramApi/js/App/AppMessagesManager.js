import { forEach, isObject } from '../Etc/Helper';
import { safeReplaceObject } from '../lib/utils';

export default class AppMessagesManagerModule {
	messages = {};
	chatPeer = 0;

	constructor(peerId) {
		this.chatPeer = peerId;

		console.log('CREATING NEW MANAGER WITH ID', peerId);

		window.cachedMessages = window.cachedMessages || {};
		window.cachedMessages[peerId] = window.cachedMessages[peerId] || {};

		this.messages = window.cachedMessages[peerId].messages || {};
		console.log('INFO', this.messages);
	}

	saveMessages = (messages = []) => {
		forEach(messages, this.saveMessage);
	};

	saveMessage = message => {
		if (!isObject(message)) {
			return;
		}

		if (!this.messages[message.id]) {
			this.messages[message.id] = message;
		} else {
			safeReplaceObject(this.messages[message.id], message);
		}

		cachedMessages[this.chatPeer].messages = this.messages;
	};

	getUpMessages = async (from_id, limit) => {
		const messages = [];
		if (from_id <= 0) {
			Object.keys(this.messages)
				.sort()
				.slice(0, limit)
				.forEach(key => {
					messages.push(this.messages[key]);
				});
		} else {
			Object.keys(this.messages)
				.filter(el => {
					return Number(el) < Number(from_id);
				})
				.sort()
				.slice(0, limit)
				.forEach(key => {
					messages.push(this.messages[key]);
				});
		}

		return messages;
	};

	getDownMessages = async (from_id, limit) => {
		const messages = [];
		Object.keys(this.messages)
			.filter(el => Number(el) > Number(from_id))
			.sort()
			.slice(0, limit)
			.forEach(key => {
				messages.push(this.messages[key]);
			});

		return messages;
	};
}
