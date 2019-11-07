import './chat-page.scss';
import template from './chat-page.html';
import dialog from './dialog';
import menu from './menu';

const startLoading = (elem) => {
    const loader = document.createElement('div');
    loader.className = 'spinner';
    elem.innerHTML = loader;
    elem.classList.add('loading');
}

const stopLoading = (elem) => {
    elem.innerHTML = '';
    elem.classList.remove('loading');
}

const data = [{
    avatar: 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
    name: 'Antoha',
    shortMsg: 'Dorowa',
    meta: 'kek'
}, {
    avatar: 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
    name: 'DRUG-DEALER',
    shortMsg: 'Dorowa',
    meta: 'kek'
}, {
    avatar: 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
    name: 'DRUGAN',
    shortMsg: 'Dorowa',
    meta: 'kek'
}, {
    avatar: 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
    name: 'Mama',
    shortMsg: 'Dorowa',
    meta: 'kek'
}, {
    avatar: 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
    name: 'Bro',
    shortMsg: 'Dorowa',
    meta: 'kek'
}, {
    avatar: 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
    name: 'Batya',
    shortMsg: 'Dorowa',
    meta: 'kek'
},
];

const loadData = (timeout) => setTimeout(() => {
    const userDialogs = document.createElement('div');
    userDialogs.id = 'user-dialogs';
    userDialogs.innerHTML = data.map(info => dialog(...Object.values(info))).join('');
    
    const left = document.getElementById('left');
    stopLoading(left);
    menu(left);
    left.appendChild(userDialogs);
}, timeout);


export default (elem) => {
    elem.innerHTML = template;
    loadData(1000);
}