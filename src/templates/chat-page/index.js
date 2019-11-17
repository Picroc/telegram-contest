import './chat-page.scss';
import template from './chat-page.html';
import dialog from './dialog';
import menu from './menu';
import { TelegramApiWrapper } from '../../utils/services';
import { subscribe, htmlToElement, startLoading, stopLoading } from '../../helpers/index';
import ChatMain from './chat-main';
import { updateSearchResults } from './contacts-menu';
import topBar from '../chat-page/chat-main/top-bar';


export const loadDialog = (peer, dialog) => {
	const right = document.getElementById('right');
	startLoading(right);
	ChatMain(right, peer).then(() => {
		stopLoading(right);
		topBar(right, dialog);
		subscribe('.top-bar__search')('click', () => {
			const search = document.getElementById('search');
			search.focus();
		});
	});
};

const ta = new TelegramApiWrapper();
const users = [];

const loadPhotos = async (from = 0) => {
	const dialogItems = document.getElementsByClassName('dialog__avatar-wrapper');
	const dialogs = document.getElementById('user-dialogs');
	console.log(dialogs.data);
	for (let i = from; i < 100; i++) {
		if (users[i].photo) {
			const photo = await ta.getPhotoFile(users[i].photo.photo_small);
			if (photo) {
				try {
					dialogItems[i].children[0].src = photo;
				} catch {
					setTimeout(() => { loadPhotos(i) }, 10000);
					break;
				}
			}
		}
	}
}

const loadData = async () => {
	const userDialogs = document.createElement('div');
	userDialogs.id = 'user-dialogs';
	const left = document.getElementById('left');
	let cached = [];
	const { id } = await telegramApi.getUserInfo();

	const load = data => {
		data.forEach(user => {
			if (cached.filter(({ title }) => user.title === title).length > 0) {
				return;
			}

			if (user.dialog_peer.user_id === id) {
				user = { ...user, savedMessages: true };
			}

			users.push(user);
			const d = htmlToElement(dialog(user));
			const { dialog_peer } = user;
			subscribe(d)('click', () => loadDialog(dialog_peer, user));
			userDialogs.appendChild(d);
		});

		const left = document.getElementById('left');

		if (cached.length === 0) {
			stopLoading(left);
			menu(left, 'contacts', updateSearchResults);
		}

		cached = data;
		left.appendChild(userDialogs);
		window.updateRipple();
	}

	await ta.getDialogs(5).then(load)
	await ta.getDialogs(100).then(load);
	return left;
};

export default elem => {
	elem.innerHTML = template;
	loadData()
		.then(() => {
			loadPhotos();
		});
	setTimeout(() => {
		const dialog = document.getElementById('user-dialogs').childNodes[0];
		dialog.dispatchEvent(new Event('click'));
	}, 2000);
};
