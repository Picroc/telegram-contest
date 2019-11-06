import './login-form.scss';
import template from './login-form.html';

const cntr = [
    {
        name: 'Kek',
        code: '+7 982'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Opa',
        code: '+6 123'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    },
    {
        name: 'Ahahaha',
        code: '+8 772'
    }
]

const subscribe = (element) => {
    return function (...args) { document.querySelector(element).addEventListener(...args); }
}

const countriesPopup = (coutries) => {
    return coutries.map(country => {
        return `
            <li class='popup-item'>
                <span class='popup-item__name'>${country.name}</span>
                <span class='popup-item__code'>${country.code}</span>
            </li>
        `
    })
        .join('');
}

const onCodeChoice = (event) => {
    const code = event.target.tagName === 'LI' ?
        event.target.querySelector('.popup-item__code').innerText :
        event.target.parentNode.querySelector('.popup-item__code').innerText;

    const name = event.target.tagName === 'LI' ?
        event.target.querySelector('.popup-item__name').innerText :
        event.target.parentNode.querySelector('.popup-item__name').innerText;

    document.querySelector('.login-form__phone').value = code;
    document.querySelector('.login-form__country').value = name;
    onCountryOut();
}

const subscribePopupItems = () => {
    const items = document.getElementsByClassName('popup-item');

    // console.log(items);

    Array.from(items, item => item.addEventListener('click', (event) => { event.stopPropagation(); return onCodeChoice(event) }));
}

const filterCountries = (value) => {
    return cntr.filter(el => el.name.includes(value));
}

const onCountyClick = (event) => {

    if (document.querySelector('.login-form__popup')) return;

    const elem = document.createElement('ul');
    elem.classList.add('login-form__popup');
    elem.innerHTML = countriesPopup(event.target.value ? filterCountries(event.target.value) : cntr);
    event.target.parentNode.appendChild(elem);

    subscribePopupItems();
}

const onCountryChange = (event) => {
    const string = event.target.value;
    const elem = event.target.parentNode.querySelector('.login-form__popup');
    elem.innerHTML = countriesPopup(filterCountries(string));

    subscribePopupItems();
}

const onCountryOut = () => {
    const elem = document.querySelector('.login-form__popup');
    if (!elem) return;
    elem.remove();
}

export default (elem) => {
    elem.innerHTML = template;

    const subCountry = subscribe('.login-form__country');
    subCountry('focus', onCountyClick);
    // subCountry('focusout', onCountryOut);
    subscribe('body')('click', onCountryOut);
    subCountry('click', (event) => { event.stopPropagation(); });
    subCountry('input', onCountryChange);
}