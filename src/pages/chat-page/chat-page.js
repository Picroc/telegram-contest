import { router, telegramApi } from '../../App';
import { setDialogs, appendDialogs, getDialogs, getUser, setUser } from '../../store/store';
import template from './chat-page.html';
import { stopLoading } from '../../helpers/index';
import './chat-page.scss';
export default class ChatPage extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		// chatPage(this);
		this.innerHTML = template;
		this.loadData();
		// const user = getUser();
		// if (user.photo === undefined) {
		// 	telegramApi.getUserPhoto('blob', 'small').then(avatar => setUser({ avatar, ...user }));
		// }
	}

	connectedCallback() {
		this.render();
	}

	loadData = async () => {
		let first = true;
		const load = data => {
			if (first) {
				const left = document.getElementById('left');
				stopLoading(left);
				left.innerHTML = `<my-menu></my-menu><user-dialogs></user-dialogs>`;
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
