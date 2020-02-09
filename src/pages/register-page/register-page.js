import template from './register-page.html';
import './register-page.scss';

export default class RegisterPage extends HTMLElement {
	constructor() {
		super();
	}

	render() {
		this.innerHTML = template;

		this.name = this.querySelector('.register-page__user-name');
		this.surname = this.querySelector('.register-page__user-surname');

		this.icon_button = this.querySelector('.register-page__icon');
		this.file_input = this.querySelector('.icon__file-select');
		this.submit = this.querySelector('.register-page__submit');

		this.icon_button.addEventListener('click', () => {
			this.file_input.click();
		});
		this.submit.addEventListener(
			'click',
			e => {
				e.preventDefault();
				console.log(this.name);
				if (!this.name.value) {
					this.showInvalid();
				}
			},
			false
		);

		this.file_input.addEventListener(
			'change',
			event => {
				this.handleFile(event.srcElement.files[0]);
			},
			false
		);

		const dragPrevent = e => {
			e.stopPropagation();
			e.preventDefault();
		};

		this.icon_button.addEventListener('dragenter', dragPrevent, false);
		this.icon_button.addEventListener('dragover', dragPrevent, false);

		this.icon_button.addEventListener('drop', e => {
			e.stopPropagation();
			e.preventDefault();

			const trans = e.dataTransfer;
			const file = trans.files[0];

			console.log(file);
		});
	}

	handleFile(file) {
		console.log(file);

		const fr = new FileReader();
		const fileReadArray = [];

		const self = this;

		fr.readAsArrayBuffer(file);
		fr.onloadend = function(e) {
			if (e.target.readyState == FileReader.DONE) {
				const arrayBuffer = e.target.result,
					array = new Uint8Array(arrayBuffer);

				for (let i = 0; i < array.length; i++) {
					fileReadArray.push(array[i]);
				}

				self.uploadPhoto(e.target.result, file);
			}
		};
	}

	showInvalid = () => {
		this.name.classList.add('input-field_invalid');

		if (this.invalidTimer) {
			clearTimeout(this.invalidTimer);
		}
		this.invalidTimer = setTimeout(() => {
			if (this.name.classList.contains('input-field_invalid')) {
				this.name.classList.remove('input-field_invalid');
			}
		}, 3000);
	};

	uploadPhoto = (photoBytes, justFile) => {
		console.log(photoBytes);
		const image = document.createElement('img');

		image.style = 'width: 160px; height: 160px;';

		image.src = window.URL.createObjectURL(new Blob([justFile]));

		this.icon_button.querySelector('.icon_display').style = 'display:none;';
		const prev = this.icon_button.querySelector('img');
		if (prev) {
			prev.remove();
		}
		this.icon_button.appendChild(image);
	};

	connectedCallback() {
		if (!this.rendered) {
			this.render();
			this.rendered = true;
		}
	}

	attributeChangedCallback() {
		this.render();
	}
}
