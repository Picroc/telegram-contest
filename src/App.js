import Login from './templates/login-form';
import LoginCode from './templates/login-code';
import LoginPassword from './templates/login-password';

import './assets/fonts.css';
import './assets/globals.scss';
import { ApiService } from './utils/services';


const apiService = new ApiService();
apiService.init();

apiService._debugAuth('+79821759743');



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
        case 'login_password': return LoginPassword;
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