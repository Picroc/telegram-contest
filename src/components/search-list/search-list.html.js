import { clsx } from '../../helpers/index';

export const person = ({ photo, isOnline, firstName, id }) => `
	<div class="search-list__person" id="search-list__person_${id}">
		<img src=${photo} class="${clsx('search-list__avatar', 'avatar', 'avatar_medium', isOnline && 'online')}"></img>
		<div class="search-list__avatar-label">${firstName}</div>
	</div>
`;

export const searchContainer = title => `
<div class="search-list__container">
	<div class="search-list__title">${title}</div>
	<div id="search-list__${title.toLowerCase()}" class="search-list__${title.toLowerCase()}-container"></div>
</div>
`;

export const recentResult = ({ avatar, title, onlineStatus }) => `
	<div class="recent-result">
		<div class="recent-result__avatar avatar avatar_medium">${avatar}</div>
		<div class="recent-result__name dialog__name">${title}</div>
		<div class="recent-result__status dialog__short-msg">${onlineStatus}</div>
	</div>
`;

export const messageResult = ({ avatar, title, message, date }) => `
	<div class="message-result dialog">
		<div class="recent-result__avatar avatar-medium">${avatar}</div>
		<div class="dialog__name">${title}</div>
		<div class="recent-result__status dialog__short-msg">${message}</div>
		<div class="dialog__time message-result__time">${date}</div>
	</div>
`;
