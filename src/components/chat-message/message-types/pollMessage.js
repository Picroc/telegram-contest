export default class PollMessage extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `<div class="poll-message"></div>`;
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
