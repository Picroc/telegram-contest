import Login from './templates/login-form';
import LoginCode from './templates/login-code';

import './assets/fonts.css';
import { ApiService } from './utils/services';
import ChatPage from './templates/chat-page';
import './assets/globals.scss';

// const apiService = new ApiService();
// apiService.init();
// apiService._debugAuth('+79821759743');

const q = (elem) => document.querySelector(elem);
const App = q('.root');

let state = {
    history: ['login']
};

const changeState = (transform) => {
    return function (...args) {
        const [oldState, newState] = [state, transform(...args)];

        state = {
            ...oldState,
            ...newState
        }
    }
}

const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
}

const switchPage = (page) => {
    switch (page) {
        case 'login': return Login;
        case 'login_code': return LoginCode;
        default: return () => { throw new ReferenceError('No such page') };
    }
}

const routePage = (page, ...args) => {
    changeState(() => ({ history: [...state.history, page] }))();
    switchPage(page)(App, routePage, ...args);
}

function render() {
    Login(App, routePage);
}

function onDocumentReady(callback) {
    document.addEventListener('DOMContentLoaded', callback);
}

onDocumentReady(render);