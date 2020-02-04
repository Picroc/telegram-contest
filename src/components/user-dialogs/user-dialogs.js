import { getDialogs, SET_DIALOGS, APPEND_DIALOGS } from '../../store/store';
import { htmlToElement, startLoading, stopLoading } from '../../helpers/index';
import chatMain from '../../templates/chat-page/chat-main/index';
import './user-dialogs.scss';
export default class UserDialogs extends HTMLElement {
	render() {
		this.id = 'user-dialogs';
		this.addEventListener(SET_DIALOGS, this.setListener, { capture: true });
		this.addEventListener(APPEND_DIALOGS, this.updateListener, { capture: true });
	}

	renderDialog = dialog => {
		const { id, pinned } = dialog;
		if (this.prevRendered && this.prevRendered.pinned && !pinned) {
			const delim = htmlToElement(`<div class='divider'></div>`);
			this.appendChild(delim);
		}
		const elem = htmlToElement(`<my-dialog anim="ripple" class="dialog" id="dialog_${id}"></my-dialog>`);
		elem.addEventListener('click', () => this.loadDialog(elem, dialog));
		this.appendChild(elem);
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
		this.innerHTML = '';
		getDialogs().forEach(this.renderDialog);
	};

	updateListener = event => {
		const dialogs = getDialogs(event.detail.length);
		dialogs.forEach(this.renderDialog);
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
