import './archives.scss';
import chatMain from '../../../templates/chat-page/chat-main/index';
import { htmlToElement, startLoading, stopLoading } from '../../../helpers/index';
import { getArchives, SET_ARCHIVES, APPEND_ARCHIVES } from '../../../store/store';
import template from './archives.html';
export default class Archives extends HTMLElement {
	render() {
		this.innerHTML = template;
		this.id = 'archives';
		this.className = 'sidebar sidebar_left archives sidebar_hidden';
		this.userDialogs = this.querySelector('user-dialogs');
		this.userDialogs.id = 'archivesUserDialogs';
		this.addEventListener(SET_ARCHIVES, this.setListener, { capture: true });
		this.addEventListener(APPEND_ARCHIVES, this.updateListener, { capture: true });
		this.backButton = this.querySelector('.archives__back');
		this.backButton.addEventListener('click', this.backButtonListener);
	}

	renderDialog = dialog => {
		const { id, pinned } = dialog;
		if (this.prevRendered && this.prevRendered.pinned && !pinned) {
			const delim = htmlToElement(`<div class='divider'></div>`);
			this.userDialogs.appendChild(delim);
		}
		const elem = htmlToElement(`<my-dialog anim="ripple" class="dialog" id="dialog_${id}"></my-dialog>`);
		elem.addEventListener('click', () => this.loadDialog(elem, dialog));
		this.userDialogs.appendChild(elem);
		this.prevRendered = dialog;
	};

	loadDialog = (elem, dialog) => {
		const { id, dialog_peer: peer } = dialog;
		if (this.prevActive) {
			if (this.prevId === id) {
				return;
			} else {
				this.prevActive.classList.toggle('dialog_active');
			}
		}
		this.prevActive = elem;
		this.prevId = id;

		elem.classList.toggle('dialog_active');
		const right = document.getElementById('right');
		startLoading(right);
		chatMain(right, peer).then(() => {
			stopLoading(right);
			const topBar = document.createElement('top-bar');
			topBar.setAttribute('user_id', id);
			right.prepend(topBar);
		});
	};

	setListener = event => {
		// this.innerHTML = '';
		getArchives().forEach(this.renderDialog);
	};

	updateListener = event => {
		const archives = getArchives(event.detail.length);
		archives.forEach(this.renderDialog);
	};

	backButtonListener = e => {
		this.classList.toggle('sidebar_hidden');
	};

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
