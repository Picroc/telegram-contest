import Login from './templates/login-form';
import './assets/fonts.css';
import ChatPage from './templates/chat-page';
import './assets/globals.scss';

// telegramApi.setConfig({
//     app: {
//         id: 1166576, /* App ID */
//         hash: '99db6db0082e27973ee4357e4637aadc', /* App hash */
//         version: '0.0.1' /* App version */
//     },
//     server: {
//         test: [
//             {
//                 id: 2, /* DC ID */
//                 host: '149.154.167.40',
//                 port: 443
//             }
//         ],
//         production: [
//             {
//                 id: 2, /* DC ID */
//                 host: '149.154.167.50',
//                 port: 443
//             }
//         ]
//     }
// });

// telegramApi.getUserInfo().then(res => { console.log("User info:", res); });

const q = (elem) => document.querySelector(elem);
const App = q('.root');

let state = {
    username: 'Picroc',
    password: '1234456',
    phone: '89821759743'
};

const changeState = (transform) => {
    return function (event) {
        const [oldState, newState] = [state, transform(event.target.value)];

        state = {
            ...oldState,
            ...newState
        }
    }
}

const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
}

function render() {
    ChatPage(App);
}

function onDocumentReady(callback) {
    document.addEventListener('DOMContentLoaded', callback);
}

onDocumentReady(render);