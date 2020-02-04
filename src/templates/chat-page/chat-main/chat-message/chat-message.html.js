import forward from './forward.svg';
import channelViews from './channel-views.svg';
import checkRead from './check-read.svg';
import checkSent from './check-sent.svg';
import sending from './sending.svg';
import sendingError from './sending-error.svg';
import { clsx, tc, cc } from "../../../../helpers";
import { telegramApi } from "../../../../App";

export default async ({
                          id,
                          date,
                          toId,
                          message,
                          out = true,
                          mentioned = false,
                          mediaUnread = false,
                          silent = false,
                          post = false,
                          fromScheduled = false,
                          fromId = 0,
                          forwardFrom = null,
                          viaBotId = 0,
                          replyToMessageId = 0,
                          media = null,
                          replyMarkup = null,
                          entities = null,
                          views = 0,
                          editDate = 0,
                          postAuthor = '',
                          groupedId = 0,
                          restrictionReason = null,
                          isChannel = false,
                          isLastFromUser = false,
                      }) => {
    const { id: userId } = await telegramApi.getUserInfo();
    const isOutgoing = out && fromId === userId;
    const wasForward = !!forwardFrom;
    const hasReply = !!replyToMessageId;
    const hasMedia = !!media;

    const chatMessageClass = clsx('chat-message',
        tc('chat-message_out', 'chat-message_in', isOutgoing),
        cc('chat-message_post', post),
        cc('chat-message_post_out_last', isLastFromUser && isOutgoing),
        cc('chat-message_post_in_last', isLastFromUser && !isOutgoing),
    );

    let photoMedia = '';
    if (hasMedia) {
        const fullMessageMedia = getFullMessageMediaTemplate(media);
        if (fullMessageMedia.length !== 0) {
            return `
                <div class=${ chatMessageClass + 'chat-message_full-media' }>
                    ${ fullMessageMedia }
                </div>`
        }
        const { _: mediaType, photo = {}, photos = [], ttl_seconds: ttlSeconds = 0 } = media;
        if (mediaType === 'messageMediaPhoto') {
            const photoElemList = photos.reduce((accum, currentPhoto) => accum += getPhotoTemplate(currentPhoto), ``);
            const photoElem = getPhotoTemplate(photo);
            photoMedia = `<div class="chat-message__photo-media">${ (photoElemList || photoElem) }</div>`
        }
        // TODO implement logic for messageMediaWebPage
    }

    const formattedMessage = getFormattedMessage({ message, entities });

    return `
        <div class=${ chatMessageClass }>
            <div class="replay"></div>
            ${ photoMedia }
            <div class="message">${ formattedMessage }</div>
        </div>`
}

const getFullMessageMediaTemplate = ({ _: mediaType }) => {
    switch (mediaType) {
        case 'messageMediaGeo':
            return `<geo-message/>`;
        case 'messageMediaGeoLive':
            return `<geo-live-message/>`;
        case 'messageMediaContact':
            return `<contact-message/>`;
        case 'messageMediaGame':
            return `<game-message/>`;
        case 'messageMediaInvoice':
            return `<invoice-message/>`;
        case 'messageMediaPoll':
            return `<poll-message/>`;
        case 'messageMediaUnsupported':
            return `<div class="chat-message_media-unsupported">
                        Sorry, this message is not supported by your version of Web Telegram.
                        Maybe we will fix it later</div>`;
        default:
            return ``;
    }
};

const getPhotoTemplate = ({
                              id,
                              date,
                              sizes,
                              dc_id: dcId,
                              access_hash: accessHash,
                              file_reference: fileReference,
                              has_stickers: hasStickers = false
                          }) => {
    const strippedSize = sizes[0];
    const charPhoto = strippedSize.bytes.reduce((accum, byte) => accum + String.fromCharCode(byte), '');
    const imageUrl = `data:image/jpg;base64, ${ btoa(charPhoto) }`;
    return `<img src=${ imageUrl } alt="Photo Media"/>`
    // TODO implement logic for all other sizes
};

function getFormattedMessage({ message, entities }) {
    return message;
}
