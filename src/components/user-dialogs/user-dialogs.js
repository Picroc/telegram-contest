import {
	getDialogs,
	SET_DIALOGS,
	APPEND_DIALOGS,
	UPDATE_DIALOG,
	getUser,
	mapId,
	updateStoreEvent,
	UPDATE_DIALOG_PHOTO,
} from '../../store/store';
import { htmlToElement } from '../../helpers/index';

export default class UserDialogs extends HTMLElement {
	render() {
		this.id = 'user-dialogs';
		this.addEventListener(SET_DIALOGS, this.setListener, { capture: true });
		this.addEventListener(APPEND_DIALOGS, this.updateListener, { capture: true });
	}

	renderDialog = dialog => {
		const { id, title } = dialog;
		this.appendChild(htmlToElement(`<my-dialog anim="ripple" id="dialog_${id}"></my-dialog>`));
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
