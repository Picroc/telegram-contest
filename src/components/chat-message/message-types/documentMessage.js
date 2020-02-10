import lottie from "lottie-web";
import { getActivePeerId, getMessage } from "../../../store/store";
import { createDiv, createElement } from "../../../helpers";

export default class DocumentMessage extends HTMLElement {
  constructor() {
    super();
    this.id = this.getAttribute("id");
    this.peerId = getActivePeerId();
  }

  render() {
    const { media: { document } } = getMessage(this.peerId, this.id);
    this.innerHTML = `<div class="document-message">${ this.getContentByMimeType(document) }</div>`;
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

  getContentByMimeType(document) {
    switch (document.mime_type) {
      case "application/x-tgsticker":
        return this.getAnimatedSticker(document);
      case "image/webp":
        return this.getSticker(document);
      default:
        "DOCUMENT";
    }
  }

  getAnimatedSticker({ id, file_reference: fileReference, date, size, thumbs, attributes }) {
    const { type, w, h, bytes } = thumbs[0];
    const [{ w: width, h: height }, { alt: altEmoji, stickerset: stickerSet }, { file_name: fileName }] = attributes;
    const stickerPreviewUrl = `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
    return `<div class="chat-message_animated-sticker"><img src="${stickerPreviewUrl}" alt="Animated Sticker"></div>`;
  };

  getSticker({ id, file_reference: fileReference, date, size, thumbs, attributes }) {
    const { type, w, h, bytes } = thumbs[0];
    const [{ w: width, h: height }, { alt: altEmoji, stickerset: stickerSet }, { file_name: fileName }] = attributes;

    return `<div>Sticker</div>`;
  }

  getAnimationItem = (data, options) => () =>
    lottie.loadAnimation({
      container: this,
      renderer: "svg",
      loop: options.loop || false,
      autoplay: options.auto || false,
      animationData: data
    });
}
