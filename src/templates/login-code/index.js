import template from './login-code.html';
import './login-code.scss';
import idle from '../../static/animation/monkey_idle.json';
import peek from '../../static/animation/monkey_track.json';

import lottie from 'lottie-web';


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

const translateAnimation = (to, time) => {
    window.current_animation.play();
    window.current_animation.addEventListener('loopComplete', () => {
        window.current_animation.destroy();
        window.current_animation = to();
        time && window.current_animation.goToAndStop(time, true);
    });
    setTimeout(() => {
        window.current_animation.destroy();
        window.current_animation = to();
        time && window.current_animation.goToAndStop(time, true);
    }, 500);
}

export default (elem, router, data) => {
    elem.innerHTML = template;

    elem.querySelector('.login-code__title').innerHTML = data.phone;

    const monkey_idle = getAnimationItem('.cd-tgsticker', idle, { auto: true, loop: true });
    const monkey_peek = getAnimationItem('.cd-tgsticker', peek, { auto: false });

    window.current_animation = monkey_idle();

    subscribe('.login-code__code')('focus', ({ target }) => { translateAnimation(monkey_peek, (Math.max(target.value.length, 1) + 25)) });
    subscribe('.login-code__code')('focusout', () => { translateAnimation(monkey_idle) });
    subscribe('.login-code__code')('input', (event) => { window.current_animation.goToAndStop(Math.max(event.target.value.length, 1) + 25, true); });
}