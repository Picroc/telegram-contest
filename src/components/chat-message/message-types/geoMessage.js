export default class GeoMessage extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		this.innerHTML = `<div class="geo-message"></div>`;
	}

	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return [];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}
}
