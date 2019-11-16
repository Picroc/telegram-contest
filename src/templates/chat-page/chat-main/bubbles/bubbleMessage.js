import './bubbleMessage.scss';

export default ({ content, isIncoming }) =>
	`<div class="bubble ${isIncoming ? 'incoming' : 'outgoing'}">${content}</div>`;
