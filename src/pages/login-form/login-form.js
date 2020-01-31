import './login-form.scss';
import template from './login-form.html';

class LoginForm extends HTMLElement {

    render() {
        this.innerHTML = template;
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

customElements.define("login-form", LoginForm);