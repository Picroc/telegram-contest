export default ({
    avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
    title,
    text = '',
    isOnline
}) => `
<div class="dialog" name="${title}"anim="ripple">
    <div class="dialog__avatar-wrapper${isOnline ? ' dialog__avatar_online' : ''}">
        <img src="${avatar}" alt="avatar" class="dialog__avatar">
    </div>
    <div class="dialog__name">${title}</div>
    <div class="dialog__short-msg">${text}</div>
</div>`;