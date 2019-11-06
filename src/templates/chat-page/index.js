import './chat-page.scss';
import template from './chat-page.html';
import user from './user';

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

const loadData = (timeout) => setTimeout(() => {
    const data = [{
        avatar: 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
        name: 'Antoha',
        shortMsg: 'Dorowa',
        meta: 'kek'
    }];
    const fragment = document.createDocumentFragment();

    data.forEach(({ avatar, name, shortMsg, meta }) => {
        fragment.appendChild(htmlToElement(user(avatar, name, shortMsg, meta)));
    });
    const left = document.getElementById('left');
    left.innerHTML = '';
    left.classList.remove('loading');
    left.appendChild(fragment);
}, timeout);

export default (elem) => {
    elem.innerHTML = template;
    loadData(1000);
}