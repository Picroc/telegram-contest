const App = document.querySelector('.root');

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

        render();
    }
}

const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
}

function loginForm(loginData) {
    return `
            <div class='login-form'>
                <h3>Login<h3>
                <label>User name:<label>
                <input class='login-form__name' type='text' placeholder='Write your name' value='${loginData.username}'>
                <br>
                <label>Password</label>
                <input class='login-form__pass' type='text' placeholder='${loginData.password || ''}'>
                <label>Your password is: ${loginData.password}</label>
                <button id='bt1' class='login-form__submit'>Push</button>
            </div>
        `
}

function onNameChange(value) {
    return { username: value };
}

function onPassChange(value) {
    return { password: value };
}

function onSubmitClick() {
    console.log(state);
}

function render() {
    App.innerHTML = loginForm(state);

    subscribe('.login-form__name')('input', changeState(onNameChange));
    subscribe('.login-form__pass')('input', onPassChange);
    subscribe('.login-form__submit')('click', onSubmitClick);
}

function onDocumentReady(callback) {
    document.addEventListener('DOMContentLoaded', callback);
}

onDocumentReady(render);