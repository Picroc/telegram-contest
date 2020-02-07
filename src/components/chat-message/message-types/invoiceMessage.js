export default class InvoiceMessage extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `<div class="invoice-message"></div>`;
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
