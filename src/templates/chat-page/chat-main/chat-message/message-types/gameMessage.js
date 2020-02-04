export default class GameMessage extends HTMLElement {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `<div class="game-message"></div>`;
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
