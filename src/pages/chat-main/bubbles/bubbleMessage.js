import './bubbleMessage.scss';

export default ({ content, isIncoming, haveTail }) =>
	`<div class="bubble ${isIncoming ? 'incoming' : 'outgoing'} ${
		haveTail ? 'have-tail' : 'tailless'
	}">${content}</div>`;
