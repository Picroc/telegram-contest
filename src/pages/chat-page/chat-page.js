import { router, telegramApi } from '../../App';
import { setDialogs, appendDialogs, setArchives, appendArchives } from '../../store/store';
import template from './chat-page.html';
import { stopLoading } from '../../helpers/index';
import './chat-page.scss';
export default class ChatPage extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		this.innerHTML = template;
		this.loadData();
	}

	connectedCallback() {
		this.render();
	}

	loadData = async () => {
		let first = true;
		const load = ({ dialog_items: data, archived_items }) => {
			console.log('dialogs', data);
			console.log('archivedItems', archived_items);
			if (first) {
				const left = document.getElementById('left');
				stopLoading(left);
				left.innerHTML = `<my-archives></my-archives><my-menu></my-menu><user-dialogs></user-dialogs>`;
				setDialogs(data);
				setArchives(archived_items);
				first = false;
			} else {
				appendDialogs(data);
				appendArchives(archived_items);
			}
			window.updateRipple();
		};

		await telegramApi.getDialogsParsed(5).then(load);
		await telegramApi.getDialogsParsed(30).then(load);
	};
}
