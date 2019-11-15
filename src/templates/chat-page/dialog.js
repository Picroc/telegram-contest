export default ({ avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg', unreadCount, title, isOnline, text, time }) => `
<div class="dialog" anim="ripple">
    <div class="dialog__avatar-wrapper${isOnline ? ' dialog__avatar_online' : ''}">
        <img src="${avatar}" alt="avatar" class="dialog__avatar">
    </div>
    <div class="dialog__name">${title}</div>
    <div class="dialog__short-msg">${text}</div>
    <div class="dialog__time">${time}</div>
    ${unreadCount > 0 ? `<div class="dialog__unread-count">${unreadCount}</div>` : ''}
</div>`