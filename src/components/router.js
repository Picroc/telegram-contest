class Router extends HTMLElement {

    render() {
        const route = this.getAttribute('route');

    }

    connectedCallback() { // (2)
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() { // (3)
        return ['route'];
    }

    attributeChangedCallback(name, oldValue, newValue) { // (4)
        this.render();
    }
}

customElements.define("my-router", Router);