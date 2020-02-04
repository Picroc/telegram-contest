import { clsx, cc, htmlToElement } from '../../helpers/index';

const saved = `<svg fill="#fff" xmlns="http://www.w3.org/2000/svg">
    <path d="M17,2 C19.209139,2 21,3.790861 21,6 L21,20.2543508 C21,21.3589203 20.1045695,22.2543871 19,22.2543871 C18.5225775,22.2543871 18.0609035,22.0835665 17.6984173,21.772864 L12,16.8885064 L6.30158275,21.772864 C5.46293106,22.4917083 4.2003311,22.3945852 3.4814868,21.5559335 C3.17078432,21.1934473 3,20.7317733 3,20.2543508 L3,6 C3,3.790861 4.790861,2 7,2 L17,2 Z M17,4 L7,4 C5.8954305,4 5,4.8954305 5,6 L5,20.2543508 L10.6984173,15.3699931 C11.4473967,14.7280108 12.5526033,14.7280108 13.3015827,15.3699931 L19,20.2543508 L19,6 C19,4.8954305 18.1045695,4 17,4 Z"/>
    </svg>
`;

export default ({
	avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
	unreadCount,
	title,
	isOnline,
	text,
	time,
	savedMessages,
	pinned,
}) => {
	const icon = savedMessages ? saved : `<img src="${avatar}" alt="avatar" class="dialog__avatar">`;

	return `
        <div class="dialog" name="${title}" anim="ripple">
            <div class="${clsx(
		'dialog__avatar-wrapper',
		cc('dialog__avatar_online', isOnline),
		cc('dialog__saved', savedMessages)
	)}">
                ${icon}
            </div>
            <div class="dialog__name">${savedMessages ? 'Saved Messages' : title}</div>
            <div class="dialog__short-msg">${text}</div>
            <div class="dialog__time">${time}</div>
            ${unreadCount > 0 ? `<div class="dialog__unread-count">${unreadCount}</div>` : ''}
        </div>
    `;
};
