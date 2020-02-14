import { peerToId, stopLoading } from '../../helpers';
import './messages.scss';
import './chatMain.scss';
import { getActivePeer, getAllMessages, putMessage } from '../../store/store';
import { telegramApi } from '../../App';
import { startLoading, htmlToElement } from '../../helpers/index';

export default class ChatMain extends HTMLElement {
	render() {
		const right = document.getElementById('right');

		const startMessageId = this.getAttribute('start-message');
		const peerId = this.getAttribute('peer-id');
		stopLoading(right);
		this.innerHTML = `
						<div class="all-messages"></div>
						<message-input></message-input>`;

		this.messagesList = this.querySelector('.all-messages');
		startLoading(this.messagesList);
		this.getMessages(peerId, startMessageId);

		this.loading = false;

		this.messagesList.addEventListener('scroll', async () => {
			if (this.messagesList.scrollTop < 500 && !this.loading) {
				console.log('Hello');
				this.loading = true;
				console.log('First', this.firstMessage, 'Last', this.lastMessage);
				await this.getMessages(peerId, this.lastMessage);
				this.loading = false;
			}
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
		const messageList = this.messagesList;

		if (messageList.classList.contains('loading')) {
			stopLoading(messageList);
		}

		const msgs = getAllMessages(peerId);
		const keys = Object.keys(msgs);
		const messages = keys.filter(el => (startMessageId > 0 ? el < startMessageId : true)).reverse();

		for (const messageId of messages) {
			messageList.appendChild(htmlToElement(`<chat-message id="${messageId}"></chat-message>`));
		}

		this.firstMessage = this.messagesList.firstChild.id;
		this.lastMessage = this.messagesList.lastChild.id;

		console.log('INFO', this.firstMessage, this.lastMessage);
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
