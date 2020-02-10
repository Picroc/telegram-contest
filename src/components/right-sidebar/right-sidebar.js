import template from './right-sidebar.html';
import './right-sidebar.scss';
import { setInnerHTML, setAttribute } from '../../helpers';
import { UPDATE_DIALOG_STATUS, getActivePeer, getActivePeerMedia } from '../../store/store';
import { getRightSidebarFieldsFromPeer, htmlToElement, capitalise, getName } from '../../helpers/index';
import infoSvg from './svg/info.js';
import phoneSvg from './svg/phone.js';
import usernameSvg from './svg/username.js';
import { telegramApi } from '../../App';
// import livelocation from './svg/livelocation.js';
// import edit from './svg/edit.js';

export default class RightSidebar extends HTMLElement {
	render() {
		this.id = 'right-sidebar';
		this.className = 'right-sidebar right-sidebar_hidden';
		this.innerHTML = template;

		this.attributesElem = this.querySelector('.right-sidebar__attributes');

		this.tabsElem = this.querySelector('.right-sidebar__tabs');

		this.materialsElem = this.querySelector('.right-sidebar__general-materials');

		this.moreButton = this.querySelector('.right-sidebar__more');
		this.moreButton.addEventListener('click', this.moreButtonListener);

		this.backButton = this.querySelector('.right-sidebar__back');
		this.backButton.addEventListener('click', this.backButtonListener);

		this.addEventListener(UPDATE_DIALOG_STATUS, this.updateStatus);
		// this.addEventListener(SET_ACTIVE_PEER, this.loadPeerSidebar);
		// this.addEventListener(SET_ACTIVE_PEER_MEDIA, this.setMedia);
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

	loadPeerSidebar = id => {
		const setHTML = setInnerHTML.bind(this);
		this.attributesElem.innerHTML = '';
		this.materialsElem.innerHTML = '';
		const generalizedPeer = getRightSidebarFieldsFromPeer(getActivePeer());
		this.generalizedPeer = generalizedPeer;
		const { notifications, avatar, name } = generalizedPeer;
		document.querySelector('.right-sidebar__avatar_img').src = avatar || window.defaultAvatar;
		setHTML('.right-sidebar__name')(name);
		switch (generalizedPeer.type) {
			case 'user':
				this.loadUserAttributes(generalizedPeer);
				this.loadTabs(['media', 'docs', 'links', 'audio']);
				this.setMedia();
				break;
			case 'groupChat':
				this.loadGroupChatAttributes(generalizedPeer);
				this.loadTabs(['members', 'media', 'docs', 'links']);
				this.setChatParticipants(id);
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
		this.tabsElem.firstChild.classList.add('tab_active'); //TODO: добавить прогрузку контента первого таба
		const membersBool = tabs[0] == 'members';
		this.underline = htmlToElement(
			`<div class="tabs__underline underline ${membersBool ? 'underline_big' : ''}"></div>`
		);
		this.tabsElem.append(this.underline);
		this.tabsElem.append(htmlToElement(`<div class="tabs__gray-line gray-line"></div>`));

		media && media.addEventListener('click', this.setMedia);
		members && members.addEventListener('click', this.setChatParticipants);
	};

	createTabElem = tab => {
		return htmlToElement(`
        <div class="tabs__tab tab tab__${tab}" id="${tab}">${capitalise(tab)}</div>`);
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

	clearMaterialsClasses = () => {
		this.materialsElem.classList = 'right-sidebar__general-materials';
	};

	setMedia = e => {
		this.materialsElem.innerHTML = '';
		this.clearMaterialsClasses();
		this.materialsElem.classList.add('right-sidebar__general-materials__media');
		const media = getActivePeerMedia();
		media.forEach(({ photo }) => {
			const placeholder = htmlToElement(`<div class="right-sidebar__general-materials_placeholder"></div>`);
			this.materialsElem.appendChild(placeholder);
			photo.then(image => placeholder.appendChild(this.createMediaElem(image, 'media')));
		});
	};

	createMediaElem = (media, name) => {
		return htmlToElement(`<img src="${media}" class="right-sidebar__general-materials__${name}-element"/>`);
	};

	setChatParticipants = async id => {
		this.materialsElem.innerHTML = '';
		this.clearMaterialsClasses();
		this.materialsElem.classList.add('right-sidebar__general-materials__participants');
		const { onlineUsers, offlineUsers } = await telegramApi.getChatParticipants(id);
		for (const { first_name, last_name, id } of onlineUsers) {
			const name = getName(first_name, last_name);
			const avatar = (await telegramApi.getPeerPhoto(id)) || window.defaultAvatar;
			const elem = this.createParticipantElem(avatar, name, 'online');
			this.materialsElem.appendChild(elem);
		}
		for (const { first_name, last_name, id } of offlineUsers) {
			const name = getName(first_name, last_name);
			const avatar = (await telegramApi.getPeerPhoto(id)) || window.defaultAvatar;
			const elem = this.createParticipantElem(avatar, name, 'offline');
			this.materialsElem.appendChild(elem);
		}
	};

	createParticipantElem = (avatar, name, status) => {
		return htmlToElement(`<div class="right-sidebar__general-materials__participants__participant">
        <div class="participants__avatar-wrapper">
            <img src="${avatar}" alt="avatar" class="participants__avatar avatar avatar_small">
        </div>
        <div class="participants__name-and-status">
            <div class="participants__name-and-status__name">${name}</div>
            <div class="participants__name-and-status__status ${status}">${status}</div>
        </div>
    </div>`);
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
