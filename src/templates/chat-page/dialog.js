export default (avatar, title, text, time) => `
<div class="dialog" name=${title}>
    <div class="dialog__avatar-wrapper">
        <img src="${avatar}" alt="avatar" class="dialog__avatar">
    </div>
    <div class="dialog__main">
        <div class="dialog__name">${title}</div>
        <div class="dialog__short-msg">${text}</div>
    </div>
    <div class="dialog__meta">${time}</div>
</div>`