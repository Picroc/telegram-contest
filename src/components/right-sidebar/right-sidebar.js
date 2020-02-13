import template from './right-sidebar.html';
import './right-sidebar.scss';
import { setInnerHTML, setAttribute } from '../../helpers';
import {
	UPDATE_DIALOG_STATUS,
	getActivePeer,
	getPeerMediaById,
	SET_ACTIVE_PEER,
	SET_ACTIVE_PEER_MEDIA,
	getDefaultAvatar,
	setPeerMediaById,
	getDialog,
	peerIdToMediaMapper,
	peerIdToMembersMapper,
	cashMedia,
} from '../../store/store';
import { getRightSidebarFieldsFromPeer, htmlToElement, capitalise, getName, createDiv } from '../../helpers/index';
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

		this.avatar = this.querySelector('.right-sidebar__avatar_img');
		this.avatar.src = getDefaultAvatar();

		this.peerAttributes = this.querySelector('.right-sidebar__attributes');

		this.tabs = this.querySelector('.right-sidebar__tabs');

		this.materials = this.querySelector('.right-sidebar__general-materials');
		this.members = this.querySelector('.right-sidebar__general-materials__members');
		this.media = this.querySelector('.right-sidebar__general-materials__media');
		this.docs = this.querySelector('.right-sidebar__general-materials__docs');
		this.links = this.querySelector('.right-sidebar__general-materials__links');
		this.audio = this.querySelector('.right-sidebar__general-materials__audio');

		this.moreButton = this.querySelector('.right-sidebar__more');
		this.moreButton.addEventListener('click', this.moreButtonListener);

		this.backButton = this.querySelector('.right-sidebar__back');
		this.backButton.addEventListener('click', this.backButtonListener);

		this.addEventListener(UPDATE_DIALOG_STATUS, this.updateStatus);
		this.addEventListener(SET_ACTIVE_PEER, this.loadPeerSidebar);
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

	loadPeerSidebar = e => {
		const peer = e.detail;
		const setHTML = setInnerHTML.bind(this);
		this.peerAttributes.innerHTML = '';
		const generalizedPeer = getRightSidebarFieldsFromPeer(peer);
		this.generalizedPeer = generalizedPeer;
		const { notifications, name, avatar, id } = generalizedPeer;
		this.setMedia(id);
		// this.setMembers(id);
		this.avatar.src = avatar;
		this.peerId = id;
		setHTML('.right-sidebar__name')(name);
		switch (generalizedPeer.type) {
			case 'user':
				this.loadUserAttributes(generalizedPeer);
				this.loadTabs(['media', 'docs', 'links', 'audio']);
				this.media.classList.remove('hide');
				break;
			case 'groupChat':
				this.loadGroupChatAttributes(generalizedPeer);
				this.loadTabs(['members', 'media', 'docs', 'links']);
				// this.setMembers(id);
				break;
		}
		const label = notifications ? 'Enabled' : 'Disabled';
		const checkbox = `<input type="checkbox" class="item__icon notifications__icon" name="notifications" id="notifications"${
			notifications ? 'checked' : ''
		}>`;
		const notificationsElem = this.createAttributeElem('notifications', 'Notifications', label, () => checkbox);
		this.peerAttributes.appendChild(notificationsElem);
	};

	loadUserAttributes = generalizedPeer => {
		const { bio, username, phone } = generalizedPeer;
		//TODO: будет скучно - можно ещё геолокацией заняться
		this.peerAttributes.appendChild(this.createAttributeElem('bio', bio, 'Bio', infoSvg));
		this.peerAttributes.appendChild(this.createAttributeElem('username', username, 'Username', usernameSvg));
		this.peerAttributes.appendChild(this.createAttributeElem('phone', phone, 'Phone', phoneSvg));
	};

	loadGroupChatAttributes = generalizedPeer => {
		const { about, link } = generalizedPeer;
		this.peerAttributes.appendChild(this.createAttributeElem('about', about, 'About', infoSvg));
		this.peerAttributes.appendChild(this.createAttributeElem('link', link, 'Link', usernameSvg));
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
		this.tabs.innerHTML = '';
		tabs.map(tab => {
			const tabElem = this.createTabElem(tab);
			tabElem.addEventListener('click', this.chooseTab);
			this.tabs.append(tabElem);
		});
		this.tabs.firstChild.classList.add('tab_active'); //TODO: добавить прогрузку контента первого таба
		const membersBool = tabs[0] == 'members';
		this.underline = htmlToElement(
			`<div class="tabs__underline underline ${membersBool ? 'underline_big' : ''}" id="underline"></div>`
		);
		this.tabs.append(this.underline);
		this.tabs.append(htmlToElement(`<div class="tabs__gray-line gray-line" id="gray-line"></div>`));
	};

	createTabElem = tab => {
		return htmlToElement(`
        <div class="tabs__tab tab tab__${tab}" id="tab_${tab}">${capitalise(tab)}</div>`);
	};

	chooseTab = e => {
		Array.from(this.tabs.childNodes).forEach((element, index) => {
			if (element.id !== 'underline' && element.id !== 'gray-line') {
				const tabName = element.id.split('_')[1];
				const assosiatedMaterialsElem = this.materials.querySelector(
					`.right-sidebar__general-materials__${tabName}`
				);
				if (element == e.target) {
					e.target.classList.add('tab_active');
					assosiatedMaterialsElem.classList.remove('hide');
					if (e.target.innerHTML == 'Members') {
						this.underline.classList.add('underline_big');
					} else {
						this.underline.classList.remove('underline_big');
					}
					this.underline.style.transform = 'translateX(' + index * 166 + '%)';
				} else {
					element.classList.remove('tab_active');
					assosiatedMaterialsElem.classList.add('hide');
				}
			}
		});
	};

	hideMaterials = () => {
		Array.from(this.materials.children).forEach(elem => {
			elem.classList.add('hide');
		});
	};

	setMedia = async id => {
		const media = await peerIdToMediaMapper(id);
		console.log('media', media);
		this.media.innerHTML = '';
		console.log(`Resolving media promises for peer ${id}`);
		media.forEach(async ({ photo }, index) => {
			const placeholder = htmlToElement(
				`<div class="right-sidebar__general-materials__media_placeholder"></div>`
			);
			this.media.appendChild(placeholder);
			const image = await photo;
			const imageElement = this.createMediaElem(image, id, index);
			placeholder.replaceWith(imageElement);
			return imageElement;
		});
	};

	createMediaElem = (media, peerId, mediaIndex) => {
		return htmlToElement(
			`<img src="${media}" class="right-sidebar__general-materials__media-element" id="peer_${peerId}_media_${mediaIndex}"/>`
		);
	};

	setMembers = async id => {
		// const { onlineUsers, offlineUsers, cashedUsers } = await peerIdToMembersMapper(id);
		// console.log('users', onlineUsers, offlineUsers, cashedUsets);
		const users = await peerIdToMembersMapper(id);
		console.log('users', users);
		if (!users.cashedHTML) {
			this.members.innerHTML = '';
			const { onlineUsers, offlineUsers } = users;
			console.log(`Resolving members promises for peer ${id}`);
			for (const { first_name, last_name, id } of onlineUsers) {
				const name = getName(first_name, last_name);
				const avatar = (await telegramApi.getPeerPhoto(id)) || window.defaultAvatar;
				const elem = this.createParticipantElem(avatar, name, 'online');
				this.materials.appendChild(elem);
			}
			for (const { first_name, last_name, id } of offlineUsers) {
				const name = getName(first_name, last_name);
				const avatar = (await telegramApi.getPeerPhoto(id)) || window.defaultAvatar;
				const elem = this.createParticipantElem(avatar, name, 'offline');
				this.materials.appendChild(elem);
			}
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
