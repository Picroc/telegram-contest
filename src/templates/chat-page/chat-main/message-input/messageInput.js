import microphoneSvg from "./microphone";
import attachSvg from './attach'
import emojiSvg from "./emoji";
import './messageInput.scss'

export default () => `
<div id="message-input">
    <div class="text-input">
        <div class="svg emoji-set">${emojiSvg()}</div>

        <textarea name="text" class="text-input__input" placeholder="Message" cols="10" wrap="hard"></textarea>
        <div class="svg attach-media">${attachSvg()}</div>
     </div>
    <div class="svg voice-message">${microphoneSvg()}</div>
</div>`;