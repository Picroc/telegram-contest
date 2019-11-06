export const subscribe = (element) => {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    return function (...args) { el.addEventListener(...args); }
};

export const htmlToElement = (html) => {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
};

const startLoading = (elem) => {
    const loader = document.createElement('div');
    loader.className = 'spinner';
    elem.innerHTML = loader;
    elem.classList.add('loading');
}

const stopLoading = (elem) => {
    elem.innerHTML = '';
    elem.classList.remove('loading');
}