import template from './login-password.html';
import './login-password.scss';

import lottie from 'lottie-web';

import idle from '../../static/animation/monkey_idle.json';
import close from '../../static/animation/monkey_close.json';
import peek from '../../static/animation/monkey_peek.json';
import close_idle from '../../static/animation/monkey_close_idle.json';
import close_peek from '../../static/animation/monkey_close_peek.json'

const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
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

        window.current_animation = getAnimationItem(elem, close_peek, { auto: true })();
        window.current_animation.addEventListener('onComplete', () => {
            window.current_animation.destroy();

            window.current_animation = getAnimationItem(elem, peek, { auto: true, loop: true })();
        });
    } else {
        window.current_animation = getAnimationItem(elem, close_peek, { auto: true })();
        window.current_animation.setDirection(-1);
        window.current_animation.addEventListener('onComplete', () => {
            window.current_animation.destroy();

            window.current_animation = getAnimationItem(elem, close, { auto: true, loop: true })();
        });
    }
}

const animFromCloseToIdle = (reverse) => {
    if (window.current_animation) window.current_animation.destroy();

    const elem = '.cd-tgsticker';

    if (!reverse) {

        window.current_animation = getAnimationItem(elem, close, { auto: true })();
        window.current_animation.goToAndPlay(50, true);
        window.current_animation.addEventListener('complete', () => {
            window.current_animation.destroy();

            window.current_animation = getAnimationItem(elem, idle, { auto: true, loop: true })();
        });
    } else {
        window.current_animation = getAnimationItem(elem, close, { auto: true })();
        window.current_animation.playSegments([10, 50], true);
    }
}

const handlePassword = () => {

}

export default (elem, router) => {
    elem.innerHTML = template;

    window.current_animation = getAnimationItem('.cd-tgsticker', idle, { auto: true, loop: true })();

    subscribe('.login-password__password')('focus', () => { animFromCloseToIdle(true) });
    subscribe('.login-password__password')('focusout', () => { animFromCloseToIdle(false) });
    subscribe('.login-password__submit')('click', () => { })
}