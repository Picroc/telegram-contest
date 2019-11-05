import Login from './templates/login-form';
import './assets/fonts.css';

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
    Login(App);
}

function onDocumentReady(callback) {
    document.addEventListener('DOMContentLoaded', callback);
}

onDocumentReady(render);