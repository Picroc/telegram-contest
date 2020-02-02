export const cc = (cls, condition) => ({ class: cls, condition });

export const clsx = (...clss) =>
	clss
		.map(item => {
			if (typeof item == 'object') {
				return item.condition ? item.class : '';
			}

			return item;
		})
		.filter(Boolean)
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

const toggle = force => elem => {
	elem.classList.toggle('hide', force);
};

export const setAttribute = function(selector) {
	return attribute => value => {
		this.querySelector(selector).setAttribute(attribute, value);
	};
};

export const hide = toggle(true);

export const show = toggle(false);

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
