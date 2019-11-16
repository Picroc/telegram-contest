import makeBubble from './bubbles/bubbleMessage';
import InputMessage from './message-input';
import { TelegramApiWrapper } from '../../../utils/services';
import { createDiv } from '../../../helpers';
import './messages.scss';

const loadMessages = peer => {
	const ta = new TelegramApiWrapper();
	return ta.getMessagesFromPeer(peer);
};

export default async peer => {
	const chatMain = createDiv('chat-main');
	const statusInfo = createDiv('status-info');
	const chatMessage = createDiv('chat-messages');
	const messageInput = InputMessage(peer);
	chatMain.append(...[statusInfo, chatMessage, messageInput]);

	await loadMessages(peer).then(messages => {
		messages.messages.forEach(message => {
			const {
				from_id: fromId,
				to_id: { user_id: userId },
				message: content,
			} = message;
			const bubbleMessage = makeBubble({ content, isIncoming: fromId !== userId });
			chatMessage.insertAdjacentHTML('beforeEnd', bubbleMessage);
		});
		console.log(messages);
	});

	return chatMain;
};
