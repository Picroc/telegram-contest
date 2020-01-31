import template from './profile-image.html';
import './profile-image.scss';

class ProfileImage extends HTMLElement {
	render() {
		this.innerHTML = template;
		this.onclick = event => event.target.remove();
	}

	connectedCallback() {
		this.render()
	}

}

customElements.define('profile-image',ProfileImage);
