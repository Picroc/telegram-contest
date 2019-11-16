import template from './login-password.html';
import './login-password.scss';

import lottie from 'lottie-web';

import { idle, peek, close_peek } from '../../utils/anim-monkey';

let router;

const state = {
    password: true,
    closed: false
}

const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
}

const showInvalid = () => {
    document.querySelector('.login-password__password').classList.add('input-field_invalid');
    document.querySelector('.login-password__password ~ label').value = 'Invalid Password';
}

const checkIsInvalid = () => {
    if (document.querySelector('.login-password__password').classList.contains('input-field_invalid')) {
        document.querySelector('.login-password__password').classList.remove('input-field_invalid');
        document.querySelector('.login-password__password ~ label').innerHTML = 'Password';
    }
}

const getAnimationItem = (elem, data, options) => () => lottie.loadAnimation({
    container: document.querySelector(elem),
    renderer: 'svg',
    loop: options.loop || false,
    autoplay: options.auto || false,
    animationData: data
})

const animFromCloseToPeek = (reverse) => {
    if (window.current_animation) window.current_animation.destroy();

    const elem = '.cd-tgsticker';

    if (!reverse) {

        window.current_animation = getAnimationItem(elem, peek, { auto: true })();
        window.current_animation.playSegments([32, 20], true);
    } else {
        window.current_animation = getAnimationItem(elem, peek, { auto: true })();
        window.current_animation.playSegments([20, 32], true);
    }
}

const animFromCloseToIdle = (reverse) => {
    if (window.current_animation) window.current_animation.destroy();

    const elem = '.cd-tgsticker';

    if (!reverse) {

        window.current_animation = getAnimationItem(elem, close_peek, { auto: true })();
        window.current_animation.playSegments([25, 0], true);
        window.current_animation.addEventListener('complete', () => {
            window.current_animation.destroy();

            window.current_animation = getAnimationItem(elem, idle, { auto: true, loop: true })();
        });
    } else {
        window.current_animation = getAnimationItem(elem, close_peek, { auto: true })();
        window.current_animation.playSegments([0, 25], true);
        window.current_animation.addEventListener('complete', () => {
            window.current_animation.destroy();
            window.current_animation = getAnimationItem(elem, peek, { auto: true })();
            window.current_animation.goToAndStop(0, true);
        });
    }
}

const handlePassword = (password) => {
    telegramApi.signIn2FA(password)
        .then(res => { console.log(res); router('chat_page'); })
        .catch(err => { console.log(err); showInvalid(); });
}

export default (elem, rt) => {
    elem.innerHTML = template;
    router = rt;

    window.current_animation = getAnimationItem('.cd-tgsticker', idle, { auto: true, loop: true })();
    subscribe('.login-password__password')('input', () => { checkIsInvalid(); })
    subscribe('.login-password__password')('focus', () => { if (!state.closed) { animFromCloseToIdle(true); state.closed = true; } });
    // subscribe('.login-password__password')('focusout', () => { if (state.closed) { animFromCloseToIdle(false); state.closed = false; } });
    subscribe('.login-password__submit')('click', () => {
        handlePassword(document.querySelector('.login-password__password').value);
    });
    subscribe('.login-password__eye')('click', () => {
        document.querySelector('.login-password__password').setAttribute('type', state.password ? 'text' : 'password');
        animFromCloseToPeek(!state.password);
        state.password = !state.password;
        state.closed = true;
    });

    window.updateRipple();
}