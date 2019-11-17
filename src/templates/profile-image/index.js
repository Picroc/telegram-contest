import template from './profile-image.html';
import './profile-image.scss';

export default callback => {
	const element = document.createElement('div');
	element.innerHTML = template;

	document.body.append(element);
	document.querySelector('.profile-image__paranja').addEventListener('click', event => {
		if (!event.target.classList.contains('profile-image__paranja')) {
			return;
		};
		event.target.remove();
		if (callback) {
			callback();
		}
	});
};
