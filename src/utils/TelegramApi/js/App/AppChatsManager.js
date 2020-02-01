import { forEach, isObject } from "../Etc/Helper";
import { safeReplaceObject } from "../lib/utils";

export default class AppsChatsManagerModule {
    chats = {};
    channelAccess = {};

    saveApiChats = (apiChats) => {
        forEach(apiChats, this.saveApiChats);
    }

    saveApiChat = (apiChat) => {
        if (!isObject(apiChat)) {
            return;
        }

        apiChat.num = (Math.abs(apiChat.id >> 1) % 8) + 1;

        if (apiChat.pFlags === undefined) {
            apiChat.pFlags = {};
        }

        if (this.chats[apiChat.id] === undefined) {
            this.chats[apiChat.id] = apiChat;
        } else {
            safeReplaceObject(this.chats[apiChat.id], apiChat);
        }
    }

    getChat = (id) => this.chats[id] || { id: id, deleted: true, access_hash: this.channelAccess[id] };

    isChannel = (id) => {
        const chat = this.chats[id];

        return chat && (chat._ == 'channel' || chat._ == 'channelForbidden') || this.channelAccess[id];
    }

    getChatInput = (id) => id || 0;

    getChannelInput = (id) => {
        if (!id) {
            return { _: 'inputChannelEmpty' };
        }
        return {
            _: 'inputChannel',
            channel_id: id,
            access_hash: this.getChat(id).access_hash || this.channelAccess[id] || 0
        };
    }
}