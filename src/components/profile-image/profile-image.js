import template from './profile-image.html';
import './profile-image.scss';

export default class ProfileImage extends HTMLElement {
	render() {
		this.innerHTML = template;
		this.onclick = event => event.target.remove();
	}

	connectedCallback() {
		this.render();
	}
}
