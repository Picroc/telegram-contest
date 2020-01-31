import './bubbleMessage.scss';

class BubbleMessage extends HTMLElement {
	render() {
		this.innerHTML = `<div class="bubble"></div>`;
		const isIncoming = this.getAttribute('isIncoming'); //'incoming' || 'outgoing'
		this.classList.add(isIncoming);
		const haveTail = this.getAttribute('haveTail'); //'have-tail' || 'tailless'
		this.classList.add(haveTail);
		// const content = this.getAttribute('content'); контент должен быть получен от родителя
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
		return ['isIncoming', 'haveTail'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}

customElements.define('bubble-message', BubbleMessage);
