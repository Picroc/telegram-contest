import { show, hide } from '../helpers/index';

export default class Router extends HTMLElement {
	render() {
		const route = this.getAttribute('route');
		this.id = 'router';
		this.innerHTML = '';
		this.appendChild(document.createElement(route));
	}

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return ['route'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
