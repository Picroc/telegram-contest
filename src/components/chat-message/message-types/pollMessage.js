import { telegramApi } from '../../../App';
import { getActivePeerId, getMessage } from '../../../store/store';
import { htmlToElement } from '../../../helpers/index';

export default class PollMessage extends HTMLElement {
	constructor() {
		super();

		this.id = this.getAttribute('id');
		this.peerId = getActivePeerId();
	}

	render() {
		const {
			media: { poll, results },
		} = getMessage(this.peerId)(this.id);
		const body = document.createElement('div');
		body.classList.add('poll-message');

		const question = htmlToElement(`<p>${poll.question}\n</p>`);
		body.appendChild(question);

		this.getPoll(poll, results).forEach(el => {
			body.appendChild(el);
		});

		this.appendChild(body);
	}

	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return [];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	getPoll = (poll, results) => {
		const isClosed = telegramApi._checkFlag(poll.flags, 0),
			isMultiple = telegramApi._checkFlag(poll.flags, 2),
			isQuiz = telegramApi._checkFlag(poll.flags, 3);

		const { question, answers } = poll;

		const items = answers.map((answer, idx) => {
			const item = document.createElement('div');
			item.classList.add('poll-message__vote-item');
			item.innerHTML = `<input type='radio' id='${idx}' name='${poll.id}' value='${answer.text}'>
            <label for='${idx}'>${answer.text}</label>`;

			item.addEventListener('click', () => {
				this.voteFor(answer.option, results, answers);
			});

			return item;
		});

		return items;
	};

	voteFor = (option, results, answers) => {
		const poll_body = this.querySelector('.poll-message');

		results.results.forEach((result, idx) => {
			console.log(result);
			const poll_item = answers.filter(el => {
				console.log('Comparing', el.option, result.option);
				console.log(this.compareOptions(el.option, result.option));
				return this.compareOptions(el.option, result.option);
			})[0];
			const item = this.querySelector(`input[value='${poll_item.text}']`).parentElement;

			const isChosen = option === result.option;

			item.innerHTML = `<p>${Math.floor((result.voters / results.total_voters) * 100)}% ${isChosen ? '<b>' : ''}${
				poll_item.text
			}${isChosen ? '</b>' : ''}</p>`;
		});
	};

	compareOptions = (option1 = [], option2 = []) => {
		if (option1.length !== option2.length) {
			return false;
		}

		for (let i = 0; i < option1.length; i++) {
			if (option1[i] !== option2[i]) {
				return false;
			}
		}
		return true;
	};
}
