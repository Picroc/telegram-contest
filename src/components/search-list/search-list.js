import { searchContainer, person, messageResult } from './search-list.html.js';
import './search-list.scss';
import { htmlToElement, hide, show } from '../../helpers/index.js';
import {
	getDialogs,
	getUser,
	SET_DIALOGS,
	APPEND_DIALOGS,
	UPDATE_DIALOG_PHOTO,
	getDialog,
	getActivePeer,
} from '../../store/store.js';
import { telegramApi } from '../../App.js';
import { renderDialog, loadDialog } from '../user-dialogs/user-dialogs.js';

export default class SearchList extends HTMLElement {
	render() {
		this.id = 'search-list';
		this.className = 'search-list search-list_hidden hide';
		this.appendChild(htmlToElement(searchContainer('People')));
		this.people = document.getElementById('search-list__people');
		this.search = document.getElementById('search');
		this.addEventListener(SET_DIALOGS, this.peopleRender);
		this.addEventListener(APPEND_DIALOGS, this.peopleRender);
		this.search.addEventListener('input', this.searchUpdate);
		this.loadDialog = loadDialog(this);
	}

	peopleRender = () => {
		const { id } = getUser();
		const dialogs = getDialogs();
		if (dialogs) {
			dialogs.forEach(async dialog => {
				const {
					dialog_peer: { _: type },
					id: user_id,
					firstName,
				} = dialog;
				if (!firstName) {
					const peer = await telegramApi.getPeerByID(user_id);
					dialog.firstName = peer.first_name;
					dialog.lastName = peer.last_name;
				}
				if (document.getElementById(`search-list__person_${user_id}`)) {
					return;
				}
				if (type === 'peerUser' && id != user_id) {
					const p = htmlToElement(person(dialog));
					p.addEventListener(UPDATE_DIALOG_PHOTO, this.updatePhotoListener);
					p.addEventListener('click', () => this.loadDialog(p)(dialog));
					this.people.appendChild(p);
				}
			});
		}
	};

	highlightText = (text, searchValue) => {
		const reg = new RegExp(searchValue, 'gi');
		return text.replace(reg, str => `<span class="message-result__message_highlighted">${str}</span>`);
	};

	showOne = elem => {
		Array.from(elem.parentNode.parentNode.chidlren, container => {
			if (container !== elem) {
				hide(container);
			} else {
				show(elem);
			}
		});
	};

	searchUpdate = async event => {
		const { value, peerId } = this.search;
		if (value === '') {
			this.innerHTML = '';
			this.render();
			this.className = 'search-list';
			this.peopleRender();
		} else {
			this.innerHTML = '';
			this.appendChild(htmlToElement(searchContainer('Global search', 'global-message')));
			const globalSearch = document.getElementById('search-list__global-message');
			const result = await telegramApi.searchMessagesGlobal(value);
			if (result.length > 0) {
				const resultHTML = await result.map(async dialog => {
					const avatar = await dialog.photo;
					let { title, from_name: from, text, date } = dialog;
					date = new Date(date * 1000);
					date = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
					text = this.highlightText(text, value);
					const resHtml = htmlToElement(messageResult({ avatar, title, text, date, from }));
					resHtml.addEventListener('click', () => this.loadDialog(resHtml)(dialog, dialog.id));
					return resHtml;
				});

				globalSearch.innerHTML = '';

				resultHTML.forEach(async html => {
					globalSearch.appendChild(await html);
				});
			}
		}
	};

	updatePhotoListener = event => {
		const {
			detail: { id },
			target,
		} = event;
		target.querySelector('.avatar').src = getDialog(id).photo;
	};

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return ['avatar', 'name', 'phone'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
