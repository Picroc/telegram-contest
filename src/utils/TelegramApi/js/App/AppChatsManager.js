import { forEach, isObject } from '../Etc/Helper';
import { safeReplaceObject } from '../lib/utils';

export default class AppsChatsManagerModule {
	constructor() {
		window.chatsManagerStorage = window.chatsManagerStorage || {};
		window.channelAccess = window.channelAccess || {};
	}

	saveApiChats = apiChats => {
		forEach(apiChats, this.saveApiChat);
	};

	saveApiChat = apiChat => {
		if (!isObject(apiChat)) {
			return;
		}

		apiChat.num = (Math.abs(apiChat.id >> 1) % 8) + 1;

		if (apiChat.pFlags === undefined) {
			apiChat.pFlags = {};
		}

		if (chatsManagerStorage[apiChat.id] === undefined) {
			chatsManagerStorage[apiChat.id] = apiChat;
		} else {
			safeReplaceObject(chatsManagerStorage[apiChat.id], apiChat);
		}
	};

	getChat = id => chatsManagerStorage[id] || { id: id, deleted: true, access_hash: channelAccess[id] };

	isChannel = id => {
		const chat = chatsManagerStorage[id];

		return (chat && (chat._ == 'channel' || chat._ == 'channelForbidden')) || channelAccess[id];
	};

	getChatInput = id => id || 0;

	getChannelInput = id => {
		if (!id) {
			return { _: 'inputChannelEmpty' };
		}
		return {
			_: 'inputChannel',
			channel_id: id,
			access_hash: this.getChat(id).access_hash || channelAccess[id] || 0,
		};
	};
}
