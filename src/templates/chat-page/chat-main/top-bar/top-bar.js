import search from './svg/search.svg';
import more from './svg/more_svg.svg';
import mute from './svg/mute_svg.svg';

export default ({
	avatar = 'https://pcentr.by/assets/images/users/7756f7da389c7a20eab610d826a25ec7.jpg',
	title,
	isOnline,
    pinnedMessage,
    voice,
    channel,
    onlineInfo
}) => {
    const online = onlineInfo ? onlineInfo : isOnline ? 'online' : 'offline';
    let muteIcon = channel && `<img src=${mute} class="top-bar__mute"></img>`;
    let info = channel ? '' : voice ? voice : pinnedMessage;

    info = info || '';
    muteIcon = muteIcon || '';

    return (
        `<nav class="top-bar">
            <img src=${avatar} class="top-bar__avatar"></img>
            <div class="top-bar__title">${title}</div>
            <div class="top-bar__online-info${channel ? " top-bar_channel" : ''}">${online}</div>
            <div class="top-bar__info">${info}</div>
            ${muteIcon}
            <div class="top-bar__search icon">
                <img src=${search}></img>
            </div>
            <div class="top-bar__more icon">
                <img src=${more}></img>
            </div>
        </nav>
    `
    )
}