import search from './svg/search.svg';
import more from './svg/more.svg';
import mute from './svg/mute.svg';
import { clsx, cc } from '../../helpers/index';
import { saved } from '../user-dialogs/dialog/dialog.html';

export default ({
	avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
	title,
	isOnline,
	pinnedMessage,
	voice,
	channel,
	onlineInfo,
	savedMessages,
	photo,
}) => {
	const online = onlineInfo ? onlineInfo : isOnline ? 'online' : 'last seen recently';
	let muteIcon = channel && `<img src=${mute} class="top-bar__mute"></img>`;
	let info = channel ? '' : voice ? voice : pinnedMessage;

	info = info || '';
	muteIcon = muteIcon || '';
	if (!(photo instanceof Promise) && photo) {
		avatar = photo;
	}
	const icon = savedMessages ? saved : `<img src="${avatar}" alt="avatar" class="dialog__avatar">`;

	const onlineInfoCls = clsx('top-bar__online-info', isOnline && 'top-bar__online-info_online');
	const avatarCls = clsx('top-bar__avatar', savedMessages && 'top-bar__saved');
	return `
            <div class="${avatarCls}">${icon}</div>
            <div class="top-bar__title">${title}</div>
            <div class="${onlineInfoCls}">${online}</div>
            <div class="top-bar__info">${info}</div>
            ${muteIcon}
            <div class="top-bar__search icon">
                <img src=${search}></img>
            </div>
            <div class="top-bar__more icon">
                <img src=${more}></img>
            </div>
    `;
};
