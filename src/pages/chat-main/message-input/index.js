import MessageInput from './messageInput';
import { htmlToElement } from '../../../helpers';

export default message => {
	return htmlToElement(MessageInput(message));
};
