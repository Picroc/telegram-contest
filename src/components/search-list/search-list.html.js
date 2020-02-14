import { clsx } from '../../helpers/index';
import { getDefaultAvatar } from '../../store/store';

export const person = ({
	avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
	isOnline,
	firstName,
	id,
	photo,
}) => {
	if (photo && !(photo instanceof Promise)) {
		avatar = photo;
	}
	return `
		<div class="search-list__person" id="search-list__person_${id}">
			<img src=${avatar} class="${clsx('search-list__avatar', 'avatar', 'avatar_medium', isOnline && 'online')}"></img>
			<div class="search-list__avatar-label">${firstName}</div>
		</div>
`;
};

export const searchContainer = (title, id = title) => `
<div class="search-list__container">
	<div class="search-list__title">${title}</div>
	<div id="search-list__${id.toLowerCase()}" class="search-list__${id.toLowerCase()}-container"></div>
</div>
`;

export const recentResult = ({ avatar, title, onlineStatus }) => `
	<div class="recent-result">
		<div class="recent-result__avatar avatar avatar_medium">${avatar}</div>
		<div class="recent-result__name dialog__name">${title}</div>
		<div class="recent-result__status dialog__short-msg">${onlineStatus}</div>
	</div>
`;

export const messageResult = ({ avatar = getDefaultAvatar(), title, text, date, from }) => {
	from = from ? `<span class="dialog__short-msg_from">${from}: </span>` : '';
	return `
	<div class="message-result dialog">
		<div class="recent-result__avatar dialog__avatar-wrapper"><img class="avatar_medium avatar" src="${avatar}"></img></div>
		<div class="dialog__name">${title}</div>
		<div class="recent-result__status dialog__short-msg">${from}${text}</div>
		<div class="dialog__time message-result__time">${date}</div>
	</div>
`;
};
