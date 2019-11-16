import makeBubble from './bubbles/bubbleMessage';
import InputMessage from './message-input';
import {TelegramApiWrapper} from '../../../utils/services';
import {createDiv, stopLoading} from '../../../helpers';
import './messages.scss';

const loadMessages = peer => {
	const ta = new TelegramApiWrapper();
	return ta.getMessagesFromPeer(peer);
};

export default async (elem, peer) => {
	const chatMain = createDiv('chat-main');
	const statusInfo = createDiv('status-info');
	const chatMessage = createDiv('chat-messages');
	let messageInput = InputMessage();
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

	elem.append(chatMain);
    console.log(elem);
    const textarea = elem.querySelector('.text-input__input');
    console.log(textarea);
    textarea.addEventListener('input', () => {
        const sendButton = document.getElementById('send-button');
        if (textarea.value.trim().length > 0) {
            sendButton.classList.remove('microphone');
            sendButton.classList.add('send-arrow');
        } else {
            sendButton.classList.remove('send-arrow');
            sendButton.classList.add('microphone');
        }
        setTimeout(function(){
            textarea.style.cssText = 'height:auto; padding:0';
            textarea.style.cssText = 'height:' + textarea.scrollHeight + 'px;max-height: 300px;';
        },0);
    });
};
