import Login from './templates/login-form';
import LoginCode from './templates/login-code';
import LoginPassword from './templates/login-password';

import './assets/fonts.css';
import './assets/globals.scss';
import chatPage from './templates/chat-page';
import RegisterPage from './templates/register-page/index';


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
        case 'register_page': return RegisterPage;
        case 'chat_page': return chatPage;
        default: return () => { throw new ReferenceError('No such page') };
    }
}

const routePage = (page, ...args) => {
    changeState(() => ({ history: [...state.history, page] }))();
    switchPage(page)(App, routePage, ...args);
}

function render() {
    Login(App, routePage);

    // DO NOT DELETE, DEBUG EXAMPLE OF UPLOADING FILE!!!!!!!!!!!

    // const test_elem = document.createElement('div')
    // test_elem.innerHTML = '<input class="test_inp" type="file"><button class="test_btn">Submit</button>';
    // document.body.appendChild(test_elem);

    // document.querySelector('.test_btn').addEventListener('click', () => {
    //     const filedata = document.querySelector('.test_inp').files;
    //     const payload = new FormData();
    //     payload.append('attach', filedata.item(0));

    //     fetch('http://localhost:5000/uploadFile', {
    //         method: 'POST',
    //         credentials: 'include',
    //         body: payload
    //     })
    //         .then(() => { console.log('SENT') })
    //         .catch(err => { console.log(err) });
    // });
}

function onDocumentReady(callback) {
    document.addEventListener('DOMContentLoaded', callback);
}

onDocumentReady(render);