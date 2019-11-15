import './chat-page.scss';
import template from './chat-page.html';
import dialog from './dialog';
import menu from './menu';
import { TelegramApiWrapper } from '../../utils/services';
import { subscribe, htmlToElement } from '../../helpers/index';

const startLoading = (elem) => {
    const loader = document.createElement('div');
    elem.innerHTML = '';
    loader.className = 'spinner';
    elem.appendChild(loader);
    elem.classList.add('loading');
}

const stopLoading = (elem) => {
    elem.innerHTML = '';
    elem.classList.remove('loading');
}

const loadDialog = ({ id }) => {
    console.log(id);
    const right = document.getElementById('right');
    startLoading(right);
};

const loadData = () => {
    const userDialogs = document.createElement('div');
    userDialogs.id = 'user-dialogs';
    const ta = new TelegramApiWrapper();
    const left = document.getElementById('left');
    ta.getDialogs(2).then(data => {
        data.map((user) => {
            const d = htmlToElement(dialog(user));
            const { id } = user;
            subscribe(d)('click', () => loadDialog({ id }));
            userDialogs.appendChild(d);
        });
        const left = document.getElementById('left');
        stopLoading(left);
        menu(left);
        left.appendChild(userDialogs);
        window.updateRipple();
    });
    return left;
};


export default (elem) => {
    elem.innerHTML = template;
    loadData();
}