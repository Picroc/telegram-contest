import template from './login-code.html';
import './login-code.scss';

export default (elem, router, data) => {
    elem.innerHTML = template;

    elem.querySelector('.h1').innerHTML = ` Hello from Code Page! Transmitted data ${data.phone}`;
}