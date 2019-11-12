
import template from './register-page.html';
import './register-page.scss';
import profileImage from '../profile-image/index';

const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
}

let telegramApi;
let router;

const handleRegister = () => {
    const name = document.querySelector('.register-page__name').value;
    const surname = document.querySelector('.register-page__surname').value;

    if (!name) {
        alert('Write name!');
        return;
    }

    telegramApi.signUp(name, surname)
        .then(res => {
            if (res.status === 'USER_CREATED') {
                router('chat_page', { telegramApi });
            } else {
                alert('Code is wrong!');
            }
        })
        .catch(err => {
            console.log('ERROR: ', err);
        });
}

export default (elem, rt, data) => {
    elem.innerHTML = template;

    telegramApi = data.telegramApi;
    router = rt;

    subscribe('.register-page__icon')('click', () => {
        profileImage();
    });

    subscribe('.register-page__submit')('click', handleRegister);
}