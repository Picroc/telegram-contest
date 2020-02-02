import { router } from '../../App';
import chatPage from '../../templates/chat-page/index';

export default class ChatPage extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		chatPage(this);
	}

	connectedCallback() {
		this.render();
	}
}
