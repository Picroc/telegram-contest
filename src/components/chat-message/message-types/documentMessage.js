export default class DocumentMessage extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `<div class="document-message"></div>`;
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
