import makeBubble from './bubbles/bubbleMessage';
import InputMessage from './message-input';
import { TelegramApiWrapper } from '../../../utils/services';
import { createDiv } from '../../../helpers';
import './messages.scss';
import './chatMain.scss';

async function* fetchMessages(peer, limit = 30) {
	const ta = new TelegramApiWrapper();
	let offsetId = 0;
	let loadAll = false;
	while (!loadAll) {
		const messages = await ta.getMessagesFromPeer(peer, limit, offsetId);
		const mes = messages.messages;
		offsetId = (mes[mes.length - 1] && mes[mes.length - 1].id) || 0;
		loadAll = mes.length === 0;

		for (const message of mes) {
			yield message;
		}
	}
}

const loadMessages = async (elem, messageGenerator) => {
	const { id } = await telegramApi.getUserInfo();
	const limit = 30;
	const messages = [];
	for (let i = 0; i < limit; i++) {
		const resp = await messageGenerator.next();
		if (resp.done) break;
		messages.push(resp.value);
	}

	let previousSentDate;
	let previousId = 0;
	for (const mes of messages) {
		const { pFlags = {}, date, entities: mentionedUsers, from_id: fromId, media, message } = mes;
		const sentDate = getSentDate(date);

		if (previousSentDate && sentDate !== previousSentDate) {
			elem.insertAdjacentHTML('beforeEnd', makeDateBubble(previousSentDate));
		}

		previousSentDate = sentDate;

		const content = getContent({ message, mentionedUsers, pFlags, date, media });
		const bubbleMessage = makeBubble({ content, isIncoming: fromId !== id, haveTail: previousId !== fromId });
		previousId = fromId;
		elem.insertAdjacentHTML('beforeEnd', bubbleMessage);
	}
};

const makeDateBubble = date => `
    <div class="date-bubble">${date}</div>
`;

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

const getContent = ({ message, date, media }) => {
	const dateObj = new Date(date);
	const formatTime = t => (t < 10 ? '0' + t : t);
	const [hours, minutes] = [dateObj.getHours(), dateObj.getMinutes()];
	const time = `${formatTime(hours)}:${formatTime(minutes)}`;
	let imageUrl;
	if (media && media.photo && media.photo.sizes && media.photo.sizes[0].bytes) {
		const sizes = media.photo.sizes;
		const STRING_CHAR = sizes[0].bytes.reduce((data, byte) => {
			return data + String.fromCharCode(byte);
		}, '');
		const base64String = btoa(STRING_CHAR);
		imageUrl = `data:image/jpg;base64, ` + base64String;
	}
	return `
        <div class="message">
            ${imageUrl ? '<img src="' + imageUrl + '" width="200px" alt="Blob image">' : ''}
            <div class="message-content">${message}</div>
            <div class="message-info">
                <div class="message-time">${time}</div>
                <div class="status sending"></div>
            </div>
        </div>`;
};

export default async (elem, peer) => {
	const chatMain = createDiv('chat-main');
	const statusInfo = createDiv('status-info');
	const chatMessage = createDiv('chat-messages');
	let messageInput = InputMessage();
	chatMain.append(...[statusInfo, chatMessage, messageInput]);

	const limit = 30;
	const messageGenerator = fetchMessages(peer, limit);
	await loadMessages(chatMessage, messageGenerator);
	chatMessage.addEventListener('scroll', () => {
		if (chatMessage.scrollTop <= 100) {
			loadMessages(chatMessage, messageGenerator).then();
		}
	});

	elem.innerHTML = chatMain.outerHTML;
	const textarea = elem.querySelector('.text-input__input');
	textarea.addEventListener('input', () => {
		const sendButton = document.getElementById('send-button');
		if (textarea.value.trim().length > 0) {
			sendButton.classList.remove('microphone');
			sendButton.classList.add('send-arrow');
		} else {
			sendButton.classList.remove('send-arrow');
			sendButton.classList.add('microphone');
		}
		setTimeout(() => {
			textarea.style.cssText = 'height:auto; padding:0';
			textarea.style.cssText = 'height:' + textarea.scrollHeight + 'px;max-height: 300px;';
		}, 0);
	});

	elem.querySelectorAll('svg').forEach(svg => {
		svg.addEventListener('click', () => {
			Array.from(elem.querySelectorAll('svg'))
				.filter(anotherSvg => anotherSvg !== svg)
				.forEach(svg => svg.classList.remove('active'));
			svg.classList.toggle('active');
		});
	});

	// document.getElementById('send-button').addEventListener('click', () => {
	//     let recipientId;
	//     switch (peer._) {
	//         case 'peerChat':
	//             recipientId = +peer.chat_id;
	//             break;
	//         case 'peerUser':
	//             recipientId = +peer.user_id;
	//             break;
	//         case 'peerChannel':
	//             recipientId = +peer.channel_id;
	//             break;
	//         default:
	//             recipientId = 0;
	//     }
	//     if (textarea.value.trim().length > 0) {
	//         telegramApi.sendMessage(recipientId, textarea.value.trim())
	//     }
	// })
};
