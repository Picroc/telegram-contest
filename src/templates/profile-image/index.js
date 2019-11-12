import template from './profile-image.html';
import './profile-image.scss';

export default (callback) => {
    const element = document.createElement('div');
    element.innerHTML = template;

    document.body.append(element);
    document.querySelector('.profile-image__paranja').addEventListener('click', (event) => {
        event.target.remove();
        if (callback) {
            callback();
        }
    });
}