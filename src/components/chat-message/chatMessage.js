import makeTemplate from './chat-message.html';
import { getMessages } from "../../store/store";
import './chatMessage.scss'

export default class ChatMessage extends HTMLElement{
    render() {
        const peer = this.getAttribute('peer');
        const messageId = this.getAttribute('id');
        const message = getMessages(peer)(messageId);
        this.innerHTML = `${makeTemplate(message)}`;
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
