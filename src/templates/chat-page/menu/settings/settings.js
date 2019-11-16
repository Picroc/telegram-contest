import back from '../svg/back_svg.svg';
import edit from '../svg/edit_svg.svg';
import language from '../svg/language_svg.svg';
import privacy from '../svg/lock_svg.svg';
import notification from '../svg/unmute_svg.svg';
import generalSettings from '../svg/settings_svg.svg';
import more from '../svg/more_svg.svg';
import logout from '../svg/logout_svg.svg';

export default ({
	avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
	name,
	phone,
}) => `<div class="sidebar sidebar_left settings sidebar_hidden">
    <div class="settings__back settings__icon icon"><img src=${back} alt=""></div>
    <div class="sidebar__title settings__title">Settings</div>
    <div class="settings__more settings__icon icon"><img src=${more} alt=""></div>
    <div class="settings__info">
        <div class="settings__avatar"><img src="${avatar}" /></div>
        <div class="settings__name">${name}</div>
        <div class="settings__phone">${phone}</div>
    </div>
    <ul class="settings-list">
        <li class="settings-list__item settings-list__edit">
            <img src="${edit}" alt="">
            <div class="settings-lit__text">Edit profile</div>
        </li>
        <li class="settings-list__item settings-list__general-settings">
            <img src="${generalSettings}" alt="">
            <div class="settings-lit__text">General settings</div>
        </li>
        <li class="settings-list__item settings-list__notifications">
            <img src="${notification}" alt="">
            <div class="settings-lit__text">Notifications</div>
        </li>
        <li class="settings-list__item settings-list__privacy">
            <img src="${privacy}" alt="">
            <div class="settings-lit__text">Privacy and security</div>
        </li>
        <li class="settings-list__item settings-list__language">
            <img src="${language}" alt="">
            <div class="settings-lit__text">Language</div>
        </li>
        <li class="settings-list__item settings-list__logout">
            <img src="${logout}" alt="">
            <div class="settings-lit__text">Logout</div>
        </li>
    </ul>
</div>`;
