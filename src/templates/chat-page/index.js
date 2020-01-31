import './chat-page.scss';
import template from './chat-page.html';
import dialog from './dialog';
import menu from './menu';
import { subscribe, htmlToElement, startLoading, stopLoading } from '../../helpers/index';
import ChatMain from './chat-main';
import { updateSearchResults } from './contacts-menu';
import topBar from '../chat-page/chat-main/top-bar';

let prevId;
let prevActive;

export const loadDialog = (elem, peer, dialog) => {
	const id = peer.channel_id || peer.chat_id || peer.user_id;
	if (prevActive) {
		if (prevId === id) {
			return;
		} else {
			prevActive.classList.toggle('dialog_active');
		}
	}
	prevActive = elem;
	prevId = id;

	elem.classList.toggle('dialog_active');
	const right = document.getElementById('right');
	const avatar = elem.children[0].children[0].src;
	dialog = { ...dialog, avatar };
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

const loadPhotos = async () => {
	const dialogs = document.getElementById('user-dialogs');
	cached.forEach((cachedItem, i) => {
		setTimeout(
			(ind => {
				if (!cachedItem.photo) {
					return;
				}
				telegramApi.getPhotoFile(cachedItem.photo.photo_small).then(photo => {
					if (photo) {
						try {
							dialogs.data[ind].children[0].children[0].src = photo;
						} catch {}
					}
				});
			})(i),
			0
		);
	});
};

let cached = [];

const loadData = async () => {
	let userDialogs = document.getElementById('div');
	const left = document.getElementById('left');

	if (!userDialogs) {
		userDialogs = document.createElement('div');
		userDialogs.id = 'user-dialogs';
	}

	const { id } = await telegramApi.getUserInfo();

	const load = data => {
		data.forEach(user => {
			if (cached.filter(({ title }) => user.title === title).length > 0) {
				return;
			}

			if (user.dialog_peer.user_id === id) {
				user = { ...user, savedMessages: true };
			}

			const d = htmlToElement(dialog(user));
			const { dialog_peer } = user;
			subscribe(d)('click', () => loadDialog(d, dialog_peer, user));
			userDialogs.appendChild(d);
		});

		const left = document.getElementById('left');

		if (cached.length === 0) {
			stopLoading(left);
			menu(left, 'contacts', updateSearchResults);
			left.appendChild(userDialogs);
		}

		cached = data;
		userDialogs.data = Array.from(userDialogs.children);
		window.updateRipple();
	};

	await telegramApi.getDialogsParsed(5).then(load);
	// await telegramApi.getDialogs(100).then(load);
	return left;
};

export default elem => {
	elem.innerHTML = template;
	loadData().then(() => {
		loadPhotos().then();
	});
};
