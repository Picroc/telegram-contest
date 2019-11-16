import './settings.scss';
import template from './settings';
import { htmlToElement, subscribe } from '../../../../helpers/index';
// info - { avatar, phone, name }

const hide = (settings) => {
    settings.classList.toggle('sidebar_hidden', true)
};

const logout = () => {
    console.log("Save me, ma frend");
};

export default (elem, info) => {
    const settings = htmlToElement(template(info));
    elem.prepend(settings);
    subscribe('.settings__back')('click', () => hide(settings))
    subscribe('.settings-list__logout')('click', () => logout())
};
