'use strict';
class HTMLViButtonElement extends HTMLElement {
  constructor() {
    super();

    const template = vi.document.querySelector('#vi-button').content;
    const svgIcons = vi.document.querySelector('#vi-iconpack').content;
    const iconClone = document.importNode(svgIcons, true);
    const templateClone = document.importNode(template, true);
    const innerButton = document.createElement('button');

    this.attachShadow({ mode: 'open' });

    innerButton.appendChild(iconClone);
    this.shadowRoot.appendChild(templateClone);
    this.shadowRoot.appendChild(innerButton);

    this.use = (icon) => {
      if(this.shadowRoot.querySelector(`#${icon}`)) {
        innerButton.setAttribute('aria-label', icon);
        this.shadowRoot.querySelector('use').setAttribute('href', `#${icon}`);
      } else {
        innerButton.setAttribute('aria-label', 'unavailable');
        this.shadowRoot.querySelector('use').setAttribute('href', '#not-found');
      }
    }
  }

  set disabled(value) {
    const innerButton = this.shadowRoot.querySelector('button');
    if (value) {
      this.setAttribute('disabled', '');
      innerButton.disabled = true;
    } else {
      this.removeAttribute('disabled');
      innerButton.disabled = false;
    }
  }
}

customElements.define('vi-button', HTMLViButtonElement);

{
  /** Play & pause button */
  function toggle(event) {
    if (!event) return;
    this.use(event.target.paused ? 'play' : 'pause');
  }

  vi.on('play', toggle, true).for('play');
  vi.on('pause', toggle, true).for('play');

  vi.for('play').on('click', function(event) {
    if (!event) {
      this.use('play');
      return;
    }

    const media = vi.u.findPlayer(event).media;
    media.paused ? media.play() : media.pause();
  });
}

{
  /** Fullscreen toggle button */
  vi.for('fullscreen').on('click', function(event) {
    if (!event) {
      this.use('fullscreen');
      return;
    }

    const player = event.path.find(node => node.tagName === 'VI-PLAYER');
    player.fullscreen();
  });
}

{
  /** Next queue button */
  vi.for('next').on('click', function(event) {
    if (!event) {
      this.use('next');
      return;
    }

    const player = event.path.find(node => node.tagName === 'VI-PLAYER');
    player.queue.load();
  });

  vi.on('timeupdate', function(event) {
    if (!event) return;
    // TODO: Display loading circle nearing end of show
  }, true).for('next');

  vi.on('sourcechange', function(event) {
    if (!event) return;
    const activeIndex = event.target.queue.list.indexOf(event.target.currentQueue);
    const lastIndex = event.target.queue.list.length - 1;

    if (activeIndex === lastIndex) this.disabled = true;
    else this.disabled = false;
  }).for('next');
}

{
  /** Prev queue button */
  vi.for('prev').on('click', function(event) {
    if (!event) {
      this.use('prev');
      return;
    }

    const player = vi.u.findPlayer(event);
    const activeIndex = player.queue.list.indexOf(player.currentQueue);

    player.queue.load(activeIndex - 1);
  });

  vi.on('sourcechange', function(event) {
    if (!event) return;
    const activeIndex = event.target.queue.list.indexOf(event.target.currentQueue);

    if (activeIndex === 0) this.disabled = true;
    else this.disabled = false;
  }).for('prev');
}

{
  /** Mute  button */
  vi.for('mute').on('click', function(event) {
    if (!event) {
      this.use('mute');
      return;
    }

    const media = vi.u.findPlayer(event).media;
    media.muted = media.muted ? false : true;
  });

  vi.on('volumechange', function(event) {
    if (!event) return;

    const media = vi.u.findPlayer(event).media;
    this.use(media.muted ? 'unmute' : 'mute');
  }, true).for('mute');
}
