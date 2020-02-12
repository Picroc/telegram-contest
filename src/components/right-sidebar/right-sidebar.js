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
} from '../../store/store';
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

		this.avatar = this.querySelector('.right-sidebar__avatar_img');
		this.avatar.src = getDefaultAvatar();

		this.peerAttributes = this.querySelector('.right-sidebar__attributes');

		this.tabs = this.querySelector('.right-sidebar__tabs');

		this.materials = this.querySelector('.right-sidebar__general-materials');
		this.members = this.querySelector('.right-sidebar__general-materials__members');
		this.media = this.querySelector('.right-sidebar__general-materials__media');
		this.media.cashed = {};
		this.docs = this.querySelector('.right-sidebar__general-materials__docs');
		this.links = this.querySelector('.right-sidebar__general-materials__links');
		this.audio = this.querySelector('.right-sidebar__general-materials__audio');

		this.moreButton = this.querySelector('.right-sidebar__more');
		this.moreButton.addEventListener('click', this.moreButtonListener);

		this.backButton = this.querySelector('.right-sidebar__back');
		this.backButton.addEventListener('click', this.backButtonListener);

		this.addEventListener(UPDATE_DIALOG_STATUS, this.updateStatus);
		this.addEventListener(SET_ACTIVE_PEER, this.loadPeerSidebar);
		this.addEventListener(SET_ACTIVE_PEER_MEDIA, this.setMedia);
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
		// this.materials.innerHTML = '';
		const generalizedPeer = getRightSidebarFieldsFromPeer(peer);
		this.generalizedPeer = generalizedPeer;
		const { notifications, name, avatar, id } = generalizedPeer;
		this.avatar.src = avatar;
		this.peerId = id;
		setHTML('.right-sidebar__name')(name);
		switch (generalizedPeer.type) {
			case 'user':
				this.loadUserAttributes(generalizedPeer);
				this.loadTabs(['media', 'docs', 'links', 'audio']);
				// this.setMedia({ detail: id });
				break;
			case 'groupChat':
				this.loadGroupChatAttributes(generalizedPeer);
				this.loadTabs(['members', 'media', 'docs', 'links']);
				// this.setChatParticipants(id);
				break;
		}
		const label = notifications ? 'Enabled' : 'Disabled';
		const checkbox = `<input type="checkbox" class="item__icon notifications__icon" name="notifications" id="notifications"${
			notifications ? 'checked' : ''
		}>`;
		const notificationsElem = this.createAttributeElem('notifications', 'Notifications', label, () => checkbox);
		this.peerAttributes.appendChild(notificationsElem);
		console.log('this.peerAttributes', this.peerAttributes);
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
			`<div class="tabs__underline underline ${membersBool ? 'underline_big' : ''}"></div>`
		);
		this.tabs.append(this.underline);
		this.tabs.append(htmlToElement(`<div class="tabs__gray-line gray-line"></div>`));
		const tab_media = this.querySelector('#tab_media');
		const tab_members = this.querySelector('#tab_members');
		if (tab_media) {
			tab_media.addEventListener('click', this.setMedia);
		}
		if (tab_members) {
			tab_members.addEventListener('click', this.setChatParticipants);
		}
	};

	createTabElem = tab => {
		return htmlToElement(`
        <div class="tabs__tab tab tab__${tab}" id="tab_${tab}">${capitalise(tab)}</div>`);
	};

	chooseTab = e => {
		Array.from(this.tabs.children).forEach((element, index) => {
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

	hideMaterials = () => {
		Array.from(this.materials.children).forEach(elem => {
			elem.classList.add('hide');
		});
	};

	setMedia = e => {
		const id = this.peerId || e.detail;
		console.log('id', id);
		if (this.media.cashed[id]) {
			return;
		}
		this.media.cashed[id] = true;
		this.media.innerHTML = '';
		this.hideMaterials();
		this.media.classList.toggle('hide'); //TODO: убрать
		const media = getPeerMediaById(id);
		console.log('media', media);
		if (media) {
			const isPromiseMedia = !!media[0].photo.then;
			if (isPromiseMedia) {
				console.log('upload media');
				const unpromisedMedia = media.map(async ({ photo }) => {
					const placeholder = htmlToElement(
						`<div class="right-sidebar__general-materials_placeholder"></div>`
					);
					this.media.appendChild(placeholder);
					const image = await photo;
					placeholder.replaceWith(this.createMediaElem(image, 'media'));
					return image;
				});
				Promise.all(unpromisedMedia).then(photoArr => setPeerMediaById(id, photoArr, true, false));
			} else {
				console.log('set media from store');
				media.forEach(({ photo }) => {
					this.materials.appendChild(this.createMediaElem(photo, 'media'));
				});
			}
		}
	};

	setMediaFromStore = id => {};

	createMediaElem = (media, name) => {
		return htmlToElement(`<img src="${media}" class="right-sidebar__general-materials__${name}-element"/>`);
	};

	setChatParticipants = async id => {
		// this.materials.innerHTML = '';
		this.hideMaterials();
		this.materials.classList.add('right-sidebar__general-materials__participants');
		const { onlineUsers, offlineUsers } = await telegramApi.getChatParticipants(id);
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
