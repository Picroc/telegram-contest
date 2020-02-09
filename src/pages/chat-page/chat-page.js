import { router, telegramApi } from '../../App';
import { setDialogs, appendDialogs, setArchives, appendArchives, updateDialogUnread } from '../../store/store';
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
			if (first) {
				const left = document.getElementById('left');
				stopLoading(left);
				left.innerHTML = `<my-archives></my-archives><my-menu></my-menu><user-dialogs></user-dialogs>`;
				console.log('dialogs', data);
				setDialogs(data);
				setArchives(archived_items);
				first = false;
			} else {
				appendDialogs(data);
				appendArchives(archived_items);
			}
			window.updateRipple();
		};

		await telegramApi.getDialogsParsed(15).then(load);
		telegramApi.invokeApi('messages.getPinnedDialogs', { folder_id: 0 }).then(({ dialogs }) => {
			dialogs.forEach(dialog => {
				const {
					peer: { channel_id, chat_id, user_id },
					unread_count: count,
					_: type,
				} = dialog;
				const id = channel_id || chat_id || user_id;
				if (type !== 'dialogFolder') {
					console.log('id', id);
					updateDialogUnread(id, count);
				}
			});
		});
		telegramApi.getDialogsParsed(100).then(load);
	};
}
