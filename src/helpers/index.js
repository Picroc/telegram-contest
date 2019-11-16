export const subscribe = element => {
	const el = typeof element === 'string' ? document.querySelector(element) : element;
	return function (...args) {
		el.addEventListener(...args);
	};
};

export const htmlToElement = html => {
	var template = document.createElement('template');
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	return template.content.firstChild;
};

export const startLoading = elem => {
	const loader = document.createElement('div');
	loader.className = 'spinner';
	elem.appendChild(loader);
	elem.classList.add('loading');
};

export const stopLoading = elem => {
	elem.innerHTML = '';
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
