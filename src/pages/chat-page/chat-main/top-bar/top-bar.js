import mute from './svg/mute.svg';
import template from './top-bar.html';
import './top-bar.scss';

export default class TopBar extends HTMLElement {
	render() {
		this.innerHTML = template;
		const setHTML = setInnerHTML.bind(this);
		const setAttr = setAttribute.bind(this);
		const avatar =
			this.getAttribute('avatar') || 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg';
		setAttr('.top-bar__avatar')('src', avatar);
		const title = this.getAttribute('title');
		setHTML('.top-bar__title')(title);
		const onlineInfo = this.getAttribute('onlineInfo'); //Maybe 'last seen recently' also to be a part of onlineInfo?
		const isOnline = this.getAttribute('isOnline');
		const onlineInfoElem = this.querySelector('top-bar__online-info');
		if (isOnline) {
			onlineInfoElem.classList.add('top-bar__online-info_online');
			setHTML('.top-bar__online-info')(onlineInfo || 'online');
		} else {
			onlineInfoElem.classList.remove('top-bar__online-info_online');
			setHTML('.top-bar__online-info')(onlineInfo); //TODO: last seen long time ago (or make it part of onlineInfo)
		}
		const info = this.getAttribute('info'); //TODO: Edit with regards to new interface
		setHTML('.top-bar__info')(info);
		const isMuted = this.getAttribute('channel');
		if (isMuted) {
			const muteIcon = document.createElement('img');
			muteIcon.className = 'top-bar__mute';
			muteIcon.src = mute;
			this.appendChild(muteIcon);
		}
	}

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return ['avatar', 'title', 'onlineInfo', 'isOnline', 'info', 'channel'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
