import './settings.scss';
import template from './settings';
import { htmlToElement, subscribe } from '../../../../helpers/index';
// info - { avatar, phone, name }

const hide = (settings) => {
    settings.classList.toggle('sidebar_hidden', true)
};

const show = (settings) => {
    settings.classList.toggle('sidebar_hidden', false);
}

const logout = () => {
    console.log("Save me, ma frend");
};

let cashed;

export default (elem, info) => {
    if (!cashed) {
        const settings = htmlToElement(template(info));
        elem.prepend(settings);
        cashed = settings;
        subscribe('.settings__back')('click', () => hide(settings));
        subscribe('.settings-list__logout')('click', () => logout());
    } 
    
    setTimeout(() => show(cashed), 0);
};
