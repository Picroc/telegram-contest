import './chatDate.scss';

export default class ChatDate extends HTMLElement {
	render() {
		this.formattedDate = this.getFormattedDate(this.getAttribute('date'));
		this.innerHTML = `<div class="chat-date">${this.formattedDate}</div>`;
	}

	connectedCallback() {
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	static get observedAttributes() {
		return ['date'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	getFormattedDate = dateAttribute => {
		const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sep', 'Okt', 'Nov', 'Dec'];
		const currentDate = new Date();
		const date = new Date(dateAttribute || Date.now());

		const [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];
		const daysPast = currentDate.getDate() - day;

		if (daysPast < 2) {
			return daysPast === 0 ? 'Today' : 'Yesterday';
		} else if (currentDate.getFullYear() - year === 0) {
			const sentMonth = months[month];
			return `${day} ${sentMonth}`;
		} else {
			const sentMonth = months[month];
			return `${day} ${sentMonth} ${year}`;
		}
	};
}
