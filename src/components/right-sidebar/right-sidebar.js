import template from './right-sidebar.html';
import './right-sidebar.scss';
import { setInnerHTML, setAttribute } from '../../helpers';
import { SET_ACTIVE_PEER, UPDATE_DIALOG_STATUS, getActivePeer } from '../../store/store';
import { getRightSidebarFieldsFromPeer, htmlToElement, capitalise } from '../../helpers/index';
import infoSvg from './svg/info.js';
import phoneSvg from './svg/phone.js';
import usernameSvg from './svg/username.js';
// import livelocation from './svg/livelocation.js';
// import edit from './svg/edit.js';

export default class RightSidebar extends HTMLElement {
	render() {
		this.id = 'right-sidebar';
		this.className = 'right-sidebar right-sidebar_hidden';
		this.innerHTML = template;

		this.attributesElem = this.querySelector('.right-sidebar__attributes');

		this.tabsElem = this.querySelector('.right-sidebar__tabs');

		this.moreButton = this.querySelector('.right-sidebar__more');
		this.moreButton.addEventListener('click', this.moreButtonListener);

		this.backButton = this.querySelector('.right-sidebar__back');
		this.backButton.addEventListener('click', this.backButtonListener);

		this.addEventListener(SET_ACTIVE_PEER, this.loadPeerSidebar); //{ capture: true }
		this.addEventListener(UPDATE_DIALOG_STATUS, this.updateStatus); //{ capture: true }
	}

	backButtonListener = e => {
		this.classList.toggle('right-sidebar_hidden');
	};

	moreButtonListener = e => {
		this.moreButton.children[1].classList.toggle('hide');
	};

	updateStatus = e => {
		const status = e.detail;
		const setHTML = setInnerHTML.bind(this);
		setHTML('.right-sidebar__status')(status);
	};

	loadPeerSidebar = () => {
		const setHTML = setInnerHTML.bind(this);
		this.attributesElem.innerHTML = '';
		const generalizedPeer = getRightSidebarFieldsFromPeer(getActivePeer());
		const { notifications, avatar, name } = generalizedPeer;
		document.querySelector('.right-sidebar__avatar_img').src = avatar;
		setHTML('.right-sidebar__name')(name);
		switch (generalizedPeer.type) {
			case 'user':
				this.loadUserAttributes(generalizedPeer);
				this.loadTabs(['media', 'docs', 'links', 'audio']);
				break;
			case 'groupChat':
				this.loadGroupChatAttributes(generalizedPeer);
				this.loadTabs(['members', 'media', 'docs', 'links']);
				break;
		}
		const label = notifications ? 'Enabled' : 'Disabled';
		const checkbox = `<input type="checkbox" class="item__icon notifications__icon" name="notifications" id="notifications"${
			notifications ? 'checked' : ''
		}>`;
		const notificationsElem = this.createAttributeElem('notifications', 'Notifications', label, () => checkbox);
		this.attributesElem.appendChild(notificationsElem);
		console.log('this.attributesElem', this.attributesElem);
	};

	loadUserAttributes = generalizedPeer => {
		const { bio, username, phone } = generalizedPeer;
		//TODO: будет скучно - можно ещё геолокацией заняться
		this.attributesElem.appendChild(this.createAttributeElem('bio', bio, 'Bio', infoSvg));
		this.attributesElem.appendChild(this.createAttributeElem('username', username, 'Username', usernameSvg));
		this.attributesElem.appendChild(this.createAttributeElem('phone', phone, 'Phone', phoneSvg));
	};

	loadGroupChatAttributes = generalizedPeer => {
		const { about, link } = generalizedPeer;
		this.attributesElem.appendChild(this.createAttributeElem('about', about, 'About', infoSvg));
		this.attributesElem.appendChild(this.createAttributeElem('link', link, 'Link', usernameSvg));
	};

	createAttributeElem = (name, value, label, svg) => {
		return htmlToElement(`<li class="attributes__item item attributes__${name}">
        ${svg(name)}
        <div class="item__text text ${name}__text">
            <div class="text__value ${name}__value">${value}</div>
            <div class="text__label ${name}__label">${label}</div>
        </div>
    </li>`);
	};

	loadTabs = tabs => {
		this.tabsElem.innerHTML = '';
		tabs.map(tab => {
			const tabElem = this.createTabElem(tab);
			tabElem.addEventListener('click', this.chooseTab);
			this.tabsElem.append(tabElem);
		});
		this.tabsElem.firstChild.classList.add('tab_active');
		const members = tabs[0] == 'members';
		this.underline = htmlToElement(
			`<div class="tabs__underline underline ${members ? 'underline_big' : ''}"></div>`
		);
		this.tabsElem.append(this.underline);
		this.tabsElem.append(htmlToElement(`<div class="tabs__gray-line gray-line"></div>`));
	};

	createTabElem = tab => {
		return htmlToElement(`
        <div class="tabs__tab tab tab__${tab}">${capitalise(tab)}</div>`);
	};

	chooseTab = e => {
		Array.from(this.tabsElem.children).forEach((element, index) => {
			if (element == e.target) {
				e.target.classList.add('tab_active');
				if (e.target.innerHTML == 'Members') {
					this.underline.classList.add('underline_big');
				} else {
					this.underline.classList.remove('underline_big');
				}
				this.underline.style.transform = 'translateX(' + index * 166 + '%)';
			} else {
				element.classList.remove('tab_active');
			}
		});
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
