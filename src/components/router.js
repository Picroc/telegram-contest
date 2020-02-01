import { show, hide } from '../helpers/index';

export default class Router extends HTMLElement {
	render() {
		const route = this.getAttribute('route');
		this.id = 'router';
		Array.from(this.children, elem => {
			elem.tagName.toLocaleLowerCase() === route ? show(elem) : hide(elem);
		});
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
