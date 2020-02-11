import { peerToId, stopLoading } from '../../helpers';
import './messages.scss';
import './chatMain.scss';
import { getActivePeer, getAllMessages, putMessage } from '../../store/store';
import { telegramApi } from '../../App';

export default class ChatMain extends HTMLElement {
	render() {
		const right = document.getElementById('right');

		const startMessageId = this.getAttribute('start-message');
		const peerId = this.getAttribute('peer-id');
		this.getMessages(peerId, startMessageId).then(messagesComponent => {
			stopLoading(right);
			this.innerHTML = `
						${messagesComponent}
						<message-input></message-input>`;
			this.querySelector('.all-messages').scrollTo({ top: 999999 });
		});
	}

	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return ['peer-id', 'start-message'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// this.render();
	}

	getMessages = async (peerId, startMessageId) => {
		await this.fetchMessages({ offsetId: startMessageId });
		let div = '';
		for (const messageId of Object.keys(getAllMessages(peerId))) {
			div += `<p><chat-message id="${messageId}"></chat-message></p>`;
		}
		return `<div class="all-messages">${div}</div>`;
	};

	fetchMessages = async ({ limit = 30, offsetId = 0, offsetDate = 0 }) => {
		const peer = getActivePeer();
		const peerId = peerToId(peer);
		const { messages } = await telegramApi.getMessagesFromPeer(peer, limit, offsetId, offsetDate);
		for (const message of messages) {
			const { id } = message;
			putMessage(peerId)(id)(message);
		}
	};
}
