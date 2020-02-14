import './archives.scss';
import chatMain from '../../../pages/chat-main/index';
import { htmlToElement, startLoading, stopLoading, createDiv } from '../../../helpers/index';
import { getArchives, SET_ARCHIVES, APPEND_ARCHIVES } from '../../../store/store';
import template from './archives.html';
import { renderDialog } from '../../user-dialogs/user-dialogs';
import { telegramApi } from '../../../App';
export default class Archives extends HTMLElement {
	render() {
		this.innerHTML = template;
		this.id = 'archives';
		this.className = 'sidebar sidebar_left archives sidebar_hidden';
		this.userDialogs = this.querySelector('.user-dialogs');
		this.userDialogs.id = 'archivesUserDialogs';
		this.renderDialog = renderDialog(this, true);

		this.addEventListener(SET_ARCHIVES, this.setListener, { capture: true });
		this.addEventListener(APPEND_ARCHIVES, this.updateListener, { capture: true });
		this.backButton = this.querySelector('.archives__back');
		this.backButton.addEventListener('click', this.backButtonListener);
		this.pinned = createDiv('pinned');
		this.pinned.id = 'pinned_dialogs';
		this.normal = createDiv('normal');
		this.normal.id = 'normal_dialogs';
		this.userDialogs.appendChild(this.pinned);
		this.userDialogs.appendChild(this.normal);
	}

	setListener = event => {
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
