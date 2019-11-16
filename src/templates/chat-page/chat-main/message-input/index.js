import MessageInput from './messageInput';
import { createDiv } from '../../../../helpers';

export default peer => {
	const messageInput = createDiv('message-input');
	messageInput.innerHTML = MessageInput(true);

	const textarea = messageInput.querySelector('text-input__input')
	return messageInput;
};
