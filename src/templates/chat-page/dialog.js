export default (avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg', title, text, time) => `
<div class="dialog" anim="ripple" name=${title}>
    <div class="dialog__avatar-wrapper">
        <img src="${avatar}" alt="avatar" class="dialog__avatar">
    </div>
    <div class="dialog__name">${title}</div>
    <div class="dialog__short-msg">${text}</div>
    <div class="dialog__meta">${time}</div>
</div>`