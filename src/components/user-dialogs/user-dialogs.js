import { setDialogs, getDialogs } from '../../store/store';

export default class UserDialogs extends HTMLElement {
	render() {
		this.id = 'user-dialogs';
		this.addEventListener('updatestore', this.updateListener, { capture: true });
	}

	updateListener = event => {
		console.log('event', event);
		console.log('dialogs', getDialogs());
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
