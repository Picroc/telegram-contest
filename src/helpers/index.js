export const cc = (cls, condition = true) => ({ class: cls, condition });
export const tc = (cls1, cls2, conditional) => cc(conditional ? cls1 : cls2);

export const clsx = (...clss) =>
	clss
		.filter(Boolean)
		.map(item => {
			if (typeof item === 'object') {
				return item.condition ? item.class : '';
			}

			return item;
		})
		.join(' ');

export const subscribe = element => {
	const el = typeof element === 'string' ? document.querySelector(element) : element;
	return function(...args) {
		el.addEventListener(...args);
	};
};

export const htmlToElement = html => {
	const template = document.createElement('template');
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	return template.content.firstChild;
};

export const setInnerHTML = function(selector) {
	return value => {
		this.querySelector(selector).innerHTML = value;
	};
};

const toggle = cls => force => elem => {
	elem.classList.toggle(cls, force);
};

const toggleHide = toggle('hide');
const toggleActive = force => elem => {
	if (force) {
		elem.setAttribute('active', 'true');
	} else {
		elem.removeAttribute('active');
	}
};

export const hide = toggleHide(true);
export const show = toggleHide(false);
export const setAttribute = function(selector) {
	return attribute => value => {
		this.querySelector(selector).setAttribute(attribute, value);
	};
};

export const setActive = toggleActive(true);
export const setNotActive = toggleActive(false);

export const startLoading = elem => {
	elem.innerHTML = '';
	elem.classList.add('loading');
};

export const stopLoading = elem => {
	elem.classList.remove('loading');
};

export const createElement = type => className => {
	const elem = document.createElement(type);
	elem.className = className;
	return elem;
};

export const createDiv = createElement('div');
export const createSpan = createElement('span');

export const createImg = (src, className) => {
	const elem = createElement('img')(className);
	elem.src = src;
	return elem;
};

export const createInput = (type, className, placeholder) => {
	const elem = createElement('input')(className);
	elem.type = type;
	elem.placeholder = placeholder;
	return elem;
};

export const getName = (first, second) => {
	if (!second) {
		return first;
	}
	return `${first} ${second}`;
};
