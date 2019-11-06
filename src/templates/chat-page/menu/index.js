import './menu.scss';
import template from './menu.html';
import { subscribe } from '../../../helpers';
import img from './search.svg';

export default (elem) => {
    const nav = document.createElement('nav');
    nav.className = 'menu';
    nav.innerHTML = template;
    nav.appendChild(search());
    elem.appendChild(nav);
};

const createDiv = (className) => {
    const elem = document.createElement('div');
    elem.className = className;
    return elem
}

const createSpan = className => {
    const elem = document.createElement('span');
    elem.className = className;
    return elem;
}

const createImg = (src, className) => {
    const elem = document.createElement('img');
    elem.className = className;
    elem.src = src;
    return elem;
}

export const onType = event => {
    const userDialogs = document.getElementById('user-dialogs');
    if (!userDialogs.data) {
        userDialogs.data = Array.from(userDialogs.children)
    }
    userDialogs.innerHTML = '';
    const string = event.target.value.toLowerCase();
    Array.from(userDialogs.data.filter(
        el => el.getAttribute('name').toLowerCase().includes(string)),
        el => userDialogs.appendChild(el)
    );
};

const search = () => {
    const searchWrapper = createDiv('menu__search-wrapper');
    const searchIcon = createImg(img, 'menu__search-icon');
    searchWrapper.appendChild(searchIcon);
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'menu__search';
    search.placeholder = 'Search';
    searchWrapper.appendChild(search);
    subscribe(search)('input', onType)
    return searchWrapper;
}