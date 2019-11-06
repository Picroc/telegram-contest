export default (avatar, name, shortMsg, meta) => `
<div class="dialog" name=${name}>
    <div class="dialog__avatar-wrapper">
        <img src="${avatar}" alt="avatar" class="dialog__avatar">
    </div>
    <div class="dialog__main">
        <div class="dialog__name">${name}</div>
        <div class="dialog__short-msg">${shortMsg}</div>
    </div>
    <div class="dialog__meta">${meta}</div>
</div>`