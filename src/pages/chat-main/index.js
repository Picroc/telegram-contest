import { peerToId, stopLoading } from '../../helpers';
import './messages.scss';
import './chatMain.scss';
import { getActivePeer, getAllMessages, putMessage } from '../../store/store';
import { telegramApi } from '../../App';
import { startLoading, htmlToElement, onScrollTop, onScrollBottom } from '../../helpers/index';

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
		this.getMessages(peerId, startMessageId, false, 100, -50).then(() => {
			document.getElementById(Number(startMessageId)).scrollIntoView({ block: 'center' });
		});

		this.loading = false;

		telegramApi.subscribeToUpdates('messages', res => {
			this.getMessages(peerId, this.firstMessage, true, 1, -2);
		});

		const removeElements = (element, fromStart = true, number) => {
			for (let i = 0; i < number; i++) {
				element.removeChild(fromStart ? element.firstChild : element.lastChild);
			}
		};

		const updateMessageIds = () => {
			this.firstMessage = this.messagesList.firstChild.id;
			this.lastMessage = this.messagesList.lastChild.id;
		};

		onScrollTop(this.messagesList, async () => {
			if (!this.loading) {
				const beforeScroll = this.messagesList.scrollTop;
				if (this.messagesList.children.length > 80) {
					removeElements(this.messagesList, true, 30);
					updateMessageIds();
				}
				this.messagesList.scrollTop = beforeScroll;
				this.loading = true;
				await this.getMessages(peerId, this.lastMessage);
				setTimeout(() => {
					this.loading = false;
				}, 100);
			}
		});
		onScrollBottom(this.messagesList, async () => {
			if (!this.loading) {
				if (this.messagesList.children.length > 80) {
					removeElements(this.messagesList, false, 30);
					updateMessageIds();
				}
				this.loading = true;
				await this.getMessages(peerId, this.firstMessage, true, 30, -30, this.firstMessage);
				setTimeout(() => {
					this.loading = false;
				}, 100);
			}
		});
	}

	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return [''];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	getMessages = async (peerId, startMessageId, prepend = false, limit = 30, addOffset, min_id) => {
		let newMessages = await this.fetchMessages({ offsetId: startMessageId, limit, addOffset, min_id });
		const messageList = this.messagesList;

		if (messageList.classList.contains('loading')) {
			stopLoading(messageList);
		}

		if (prepend) {
			newMessages = newMessages.reverse();
		}

		newMessages.forEach(({ id: messageId }) => {
			if (prepend) {
				messageList.prepend(htmlToElement(`<chat-message id="${messageId}"></chat-message>`));
			} else {
				messageList.append(htmlToElement(`<chat-message id="${messageId}"></chat-message>`));
			}
		});

		this.firstMessage = this.messagesList.firstChild.id;
		this.lastMessage = this.messagesList.lastChild.id;
	};

	fetchMessages = async ({ limit = 30, offsetId = 0, addOffset = 0, max_id, min_id }) => {
		const peer = getActivePeer();
		const peerId = peerToId(peer);
		const { messages } = await telegramApi.getMessagesFromPeer(peer, limit, offsetId, addOffset, max_id, min_id);
		for (const message of messages) {
			const { id } = message;
			putMessage(peerId)(id)(message);
		}
		return messages;
	};
}
