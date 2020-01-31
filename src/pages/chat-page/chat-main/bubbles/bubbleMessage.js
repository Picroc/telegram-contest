import './bubbleMessage.scss';

export default ({ content, isIncoming, haveTail }) =>
	`<div class="bubble ${isIncoming ? 'incoming' : 'outgoing'} ${
		haveTail ? 'have-tail' : 'tailless'
	}">${content}</div>`;

class BubbleMessage extends HTMLElement {
	render() {
		this.innerHTML = `<div class="bubble"></div>`;
		const isIncoming = this.getAttribute('isIncoming');
		this.classList.add(isIncoming);
		const haveTail = this.getAttribute('haveTail');
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
