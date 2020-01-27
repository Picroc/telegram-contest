import template from './index.html';

class TimeFormatted extends HTMLElement {

    render() { // (1)
        this.innerHTML = template;
        this.onclick = 
    }

    connectedCallback() { // (2)
    }

    static get observedAttributes() { // (3)
        return ['datetime', 'year', 'month', 'day', 'hour', 'minute', 'second', 'time-zone-name', 'data'];
    }

    attributeChangedCallback(name, oldValue, newValue) { // (4)
        this.render();
    }

}

customElements.define("time-formatted", TimeFormatted);