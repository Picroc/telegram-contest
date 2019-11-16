import './chat-page.scss';
import template from './chat-page.html';
import dialog from './dialog';
import menu from './menu';
import { TelegramApiWrapper } from '../../utils/services';
import { subscribe, htmlToElement, startLoading, stopLoading } from '../../helpers/index';
import ChatMain from './chat-main';
import topBar from '../chat-page/chat-main/top-bar';


const loadDialog = (peer, dialog) => {
	const right = document.getElementById('right');
	startLoading(right);
	ChatMain(right, peer).then(() => {
		stopLoading(right);
		subscribe('.top-bar__search')('click', () => {
			const search = document.getElementById('search');
			search.focus();
		});
	});
    topBar(right, dialog);
};

const loadData = () => {
	const userDialogs = document.createElement('div');
	userDialogs.id = 'user-dialogs';
	const ta = new TelegramApiWrapper();
	// ta.spamMyself('@HarsvsdddksvkdvknslvknslkvnsdlkvnsdkvnsdlkvsdkvlsdkndLight');
	const left = document.getElementById('left');
	ta.getDialogs(2).then(data => {
		data.map(user => {
			const d = htmlToElement(dialog(user));
			const { dialog_peer } = user;
			subscribe(d)('click', () => loadDialog(dialog_peer, user));
			userDialogs.appendChild(d);
		});
		const left = document.getElementById('left');
		stopLoading(left);
		menu(left);
		left.appendChild(userDialogs);
		window.updateRipple();
	});
	return left;
};

export default elem => {
	elem.innerHTML = template;
	loadData();
	setTimeout(() => {
		const dialog = document.getElementById('user-dialogs').childNodes[0];
		dialog.dispatchEvent(new Event('click'));
	}, 500);
};
