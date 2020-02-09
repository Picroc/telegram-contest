import makeTemplate from './chat-message.html';
import { getMessage, getCurrentPeerId } from "../../store/store";
import './chatMessage.scss'

export default class ChatMessage extends HTMLElement{
    render() {
        const peer = getCurrentPeerId();
        const messageId = this.getAttribute('id');
        const message = getMessage(peer, messageId);
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
