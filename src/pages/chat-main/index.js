import makeBubble from './bubbles/bubbleMessage';
import InputMessage from './message-input';
import { createDiv } from '../../helpers';
import './messages.scss';
import './chatMain.scss';
import { telegramApi } from '../../App';
import Message from '../../components/chat-message/chatMessage';
const store = window.store;
store.messages = []; // stores {peer: [...messageIds]}

async function* fetchMessages(peer, limit = 30, offsetId = 0) {
	let loadAll = false;
	while (!loadAll) {
		const { messages } = await telegramApi.getMessagesFromPeer(peer, limit, offsetId);
		const mesLen = messages.lenght;
		offsetId = (messages[mesLen - 1] && messages[mesLen - 1].id) || 0;
		loadAll = mesLen === 0;

		for (const message of messages) {
			yield message;
		}
	}
}

export const loadMessages = async (elem, peer, messageGenerator) => {
	const { id } = await telegramApi.getUserInfo();
	const limit = 30;
	const messages = [];
	for (let i = 0; i < limit; i++) {
		const resp = await messageGenerator.next();
		if (resp.done) {
			break;
		}
		// TODO add date logic
		let previousSentDate;
		let previousId = 0;
		const { id, peer } = resp.value;
		elem.insertAdjacentHTML('beforeend', `<chat-message id="${id}" peer="${peer}"/>`);
	}
};

const getSentDate = time => {
	const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sep', 'Okt', 'Nov', 'Dec'];
	const currentDate = new Date();
	const date = new Date(time * 1000);

	const [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];
	const daysPast = currentDate.getDate() - day;

	if (daysPast < 2) {
		return daysPast === 0 ? 'Today' : 'Yesterday';
	} else if (currentDate.getFullYear() - year === 0) {
		const sentMonth = months[month];
		return `${day} ${sentMonth}`;
	} else {
		const sentMonth = months[month];
		return `${day} ${sentMonth} ${year}`;
	}
};
