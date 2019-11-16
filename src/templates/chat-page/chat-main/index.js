import makeBubble from './bubbles/bubbleMessage';
import InputMessage from './message-input';
import {TelegramApiWrapper} from '../../../utils/services';
import {createDiv} from '../../../helpers';
import './messages.scss';
import './chatMain.scss'

const loadMessages = peer => {
    const ta = new TelegramApiWrapper();
    return ta.getMessagesFromPeer(peer, 15);
};

const makeDateBubble = date => `
    <div class="date-bubble">${date}</div>
`;

const getSentDate = time => {
    const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'Sep', 'Okt', 'Nov', "Dec"];
    const currentDate = new Date();
    const date = new Date(time * 1000);

    const [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];
    const daysPast = currentDate.getDate() - day;

    if (daysPast < 2) {
        console.log('check day', day, currentDate.getDate(), daysPast, daysPast === 0 ? 'Today' : 'Yesterday');
        return daysPast === 0 ? 'Today' : 'Yesterday';
    } else if (currentDate.getFullYear() - year === 0) {
        const sentMonth = months[month];
        return `${day} ${sentMonth}`
    } else {
        const sentMonth = months[month];
        return `${day} ${sentMonth} ${year}`
    }
};

const getContent = ({message, date}) => {
    const dateObj = new Date(date);
    const formatTime = t => t < 10 ? "0" + t : t;
    const [hours, minutes] = [dateObj.getHours(), dateObj.getMinutes()];
    const time = `${formatTime(hours)}:${formatTime(minutes)}`;
    return `
        <div class="message">
            <div class="message-content">${message}</div>      
            <div class="message-info">
                <div class="message-time">${time}</div>
                <div class="status sending"></div>
            </div>
        </div>`;
};

export default async (elem, peer) => {
    console.log('PEER', peer);
    const chatMain = createDiv('chat-main');
    const statusInfo = createDiv('status-info');
    const chatMessage = createDiv('chat-messages');
    let messageInput = InputMessage();
    const {id} = await telegramApi.getUserInfo();
    chatMain.append(...[statusInfo, chatMessage, messageInput]);

    await loadMessages(peer).then(messages => {
        let previousSentDate;
        let previousId = 0;
        for (const mes of messages.messages) {
            console.log(mes);
            const {
                pFlags,
                date,
                entities: mentionedUsers,
                from_id: fromId,
                to_id: {user_id: userId},
                media,
                message,
            } = mes;
            const sentDate = getSentDate(date);

            if (previousSentDate && sentDate !== previousSentDate) {
                chatMessage.insertAdjacentHTML('beforeEnd', makeDateBubble(previousSentDate));
            }

            previousSentDate = sentDate;

            const content = getContent({message, mentionedUsers, pFlags, date, media});
            const bubbleMessage = makeBubble({content, isIncoming: fromId !== id, haveTail: previousId !== fromId});
            previousId = fromId;
            chatMessage.insertAdjacentHTML('beforeEnd', bubbleMessage);
        }
        console.log(messages);
    });


    elem.append(chatMain);
    const textarea = elem.querySelector('.text-input__input');
    textarea.addEventListener('input', () => {
        const sendButton = document.getElementById('send-button');
        if (textarea.value.trim().length > 0) {
            sendButton.classList.remove('microphone');
            sendButton.classList.add('send-arrow');
        } else {
            sendButton.classList.remove('send-arrow');
            sendButton.classList.add('microphone');
        }
        setTimeout(() => {
            textarea.style.cssText = 'height:auto; padding:0';
            textarea.style.cssText = 'height:' + textarea.scrollHeight + 'px;max-height: 300px;';
        }, 0);
    });

    elem.querySelectorAll('svg').forEach(svg => {
        svg.addEventListener('click', () => {
            Array.from(elem.querySelectorAll('svg'))
                .filter(anotherSvg => anotherSvg !== svg)
                .forEach(svg => svg.classList.remove('active'));
            svg.classList.toggle('active');
        })
    })
};
