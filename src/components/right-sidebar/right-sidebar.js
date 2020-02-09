import template from './right-sidebar.html';
import './right-sidebar.scss';
import { setInnerHTML, setAttribute } from '../../helpers';
import { SET_ACTIVE_PEER, getActivePeer } from '../../store/store';
import { getName } from '../../helpers/index';

export default class RightSidebar extends HTMLElement {
	render() {
		this.id = 'right-sidebar';
		this.className = 'right-sidebar right-sidebar_hidden';
		this.innerHTML = template;

		this.moreButton = this.querySelector('.right-sidebar__more');
		this.moreButton.addEventListener('click', this.moreButtonListener);

		this.backButton = this.querySelector('.right-sidebar__back');
		this.backButton.addEventListener('click', this.backButtonListener);

		this.addEventListener(SET_ACTIVE_PEER, this.loadPeerInfo); //{ capture: true }
	}

	backButtonListener = e => {
		this.classList.toggle('right-sidebar_hidden');
	};

	moreButtonListener = e => {
		this.moreButton.children[1].classList.toggle('hide');
	};

	loadPeerInfo = () => {
		const setHTML = setInnerHTML.bind(this);
		const { first_name, last_name, username, avatar } = getActivePeer();
		setHTML('.right-sidebar__name')(getName(first_name, last_name));
		setHTML('.text__username')(username);
		document.querySelector('.right-sidebar__avatar_img').src = avatar;
	};

	connectedCallback() {
		// (2)
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		// (3)
		return ['avatar', 'name', 'phone'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// (4)
		this.render();
	}
}
