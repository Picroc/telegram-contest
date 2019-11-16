import template from './top-bar.js';
import { htmlToElement, subscribe } from '../../../../helpers/index.js';
import './top-bar.scss';

export default (elem, info) => {
	elem.prepend(htmlToElement(template(info)));
};
