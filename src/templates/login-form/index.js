import './login-form.sass';
import template from './login-form.html';
import TdLibController from '../../core/TDLibController';

export default (elem) => {
    elem.innerHTML = template;

    TdLibController.init(window.location);
}