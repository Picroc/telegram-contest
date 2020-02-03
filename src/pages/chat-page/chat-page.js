import { router, telegramApi } from '../../App';
import { setDialogs, appendDialogs, getDialogs } from '../../store/store';
import template from './chat-page.html';
export default class ChatPage extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		// chatPage(this);
		this.innerHTML = template;
		this.loadData();
	}

	connectedCallback() {
		this.render();
	}

	loadData = async () => {
		let first = true;
		const load = data => {
			if (first) {
				setDialogs(data);
				first = false;
			} else {
				appendDialogs(data);
			}
			window.updateRipple();
		};

		await telegramApi.getDialogsParsed(0, 5).then(load);
		await telegramApi.getDialogsParsed(0, 30).then(load);
	};
}
