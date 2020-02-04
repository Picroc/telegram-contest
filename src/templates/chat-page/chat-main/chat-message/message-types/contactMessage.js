export default class ContactMessage extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `<div class="contact-message"></div>`;
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
