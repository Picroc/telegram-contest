// import microphoneSvg from './microphone.svg';
import attachSvg from './attach';
import emojiSvg from './emoji';
import './messageInput.scss';
import sendArrow from './sendArrow.svg';

export default (message = '') => `
    <div class="message-input">
        <div class="text-input">
            <div class="svg emoji-set">${emojiSvg()}</div>
            <textarea name="text" value="${message}" class="text-input__input" placeholder="Message" cols="10" wrap="hard" autofocus></textarea>
            <div class="svg attach-media">${attachSvg()}</div>
         </div>
        <div class="svg voice-message"><div id="send-button" class="microphone"></div></div>
    </div>
`;
