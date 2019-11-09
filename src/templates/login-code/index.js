import template from './login-code.html';
import './login-code.scss';
import idle from '../../static/animation/monkey_idle.json';
import peek from '../../static/animation/monkey_track.json';

import lottie from 'lottie-web';


const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
}

let telegramApi;
let router;
let phone;

const validateCode = (event) => {
    const code = event.target.value;

    const newText = code.replace(/\D/g, '').slice(0, 5);

    if (newText.length === 5) {
        telegramApi.signInUser(phone, code)
            .then(() => {
                router('chat_page', { telegramApi });
            })
            .catch(err => {
                alert("Code invalid!");
                console.log(err);
            })
    }

    event.target.value = newText;
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

export default (elem, rt, data) => {
    elem.innerHTML = template;

    telegramApi = data.telegramApi;
    router = rt;
    phone = data.phone;

    elem.querySelector('.login-code__title').innerHTML = phone;

    const monkey_idle = getAnimationItem('.cd-tgsticker', idle, { auto: true, loop: true });
    const monkey_peek = getAnimationItem('.cd-tgsticker', peek, { auto: false });

    window.current_animation = monkey_idle();
    const loginCode = subscribe('.login-code__code');

    loginCode('focus', ({ target }) => { translateAnimation(monkey_peek, (Math.max(target.value.length, 1) + 25)) });
    loginCode('focusout', () => { translateAnimation(monkey_idle) });
    loginCode('input', (event) => { window.current_animation.goToAndStop(Math.max(event.target.value.length, 1) + 25, true); });
    loginCode('input', validateCode)
}