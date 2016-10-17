'use strict';

class HTMLViPlayerElement extends HTMLElement {
  createdCallback() {
    if (!this.media) this.insertBefore(document.createElement('video'), this.firstChild);

    // This shadow stuff is temporary, need a nicer way to do it.
    const shadowWrapper = document.createElement('vi-shadow');
    const shadowTemplate = vi.document.querySelector('#shadow');
    const shadowClone = document.importNode(shadowTemplate.content, true);
    const shadow = shadowWrapper.attachShadow({ mode: 'closed' });
    const icon = shadowClone.querySelector('#playback-icon');
    const spinner = shadowClone.querySelector('svg use');

    spinner.setAttribute('href', '#wait');
    icon.className = 'waiting';

    shadow.appendChild(shadowClone);

    this.insertBefore(shadowWrapper, this.media.nextSibling);

    this.queue = {
      list: [],
      index: -1,
    };

    this.queue.add = (...items) => {
      items.forEach(({ src, subtitles, detail }) => {
        this.queue.list.push({ src, subtitles, detail });
      });
      if (!this.media.src) this.queue.load();
    };

    this.queue.load = (i) => {
      if (!this.queue.list.length) return;

      const current = Number(this.queue.index);
      const next = (i !== undefined) ? i : current + 1;

      if (next > this.queue.list.length - 1) return;

      this.media.src = this.queue.list[next].src;
      this.media.play().catch((err) => {
        // This fails on phones if no previous user interaction was done.

        // this.dispatchEvent(new CustomEvent('playerror', { detail: next }));
        // this.queue.load();
      });

      this.refreshTracks(next);

      this.queue.index = next;
      this.dispatchEvent(new CustomEvent('sourcechange', { detail: next }));
    };

    this.refreshTracks = (index = this.queue.index) => {
      Array.from(this.media.querySelectorAll('track')).forEach((track) => {
        track.remove();
      });

      for (const lang in this.queue.list[index].subtitles) {
        const track = document.createElement('track');

        track.src = this.queue.list[index].subtitles[lang];
        track.srclang = lang;
        track.label = lang;

        if (lang === this.sublang) track.default = true;

        this.media.appendChild(track);
      }
    }

    /** Controller object */
    const controls = {
      _immerseTimeout: null,
    };

    controls.show = () => {
      this.immersed = false;
    };

    controls.hide = () => {
      this.immersed = true;
    };

    controls.timeout = (duration = 2000) => {
      controls.show();
      clearTimeout(controls._immerseTimeout);
      if (!this.media.paused) {
        controls._immerseTimeout = setTimeout(() => {
          controls.hide();
        }, duration);
      }
    };

    /** Temp. fullscreen handling goes here, while the fullscreen API is not done */
    this.fullscreen = () => {
      if (this === document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      } else {
        this.webkitRequestFullscreen();
      }
    };

    this.addEventListener('loadedmetadata', (event) => {
      const storedVolumeLevel = localStorage.getItem('vi.volume');
      event.target.volume = 0; // Force volumechange event
      event.target.volume =  storedVolumeLevel === null ? 0 : storedVolumeLevel;
    }, true);

    this.addEventListener('ended', (event) => {
      if (event.target !== this.media) return;
      if (this.hasAttribute('autoplay')) this.queue.load();
    }, true)

    this.addEventListener('mousemove', () => controls.timeout(), { passive: true });
    this.addEventListener('mouseout', () => controls.timeout(0), { passive: true });

    const playbackChange = (event) => {
      if (event.target !== this.media) return;

      switch(event.type) {
        case 'waiting':
        case 'play':
          controls.timeout();
          spinner.setAttribute('href', '#wait');
          icon.className = 'waiting';
          break;

        case 'playing':
          spinner.setAttribute('href', '#play');
          icon.className = 'playing';
          break;

        case 'pause':
          controls.timeout();
          spinner.setAttribute('href', '#pause');
          icon.className = 'paused';
          break;

      }
    };

    this.addEventListener('play', playbackChange, true);
    this.addEventListener('playing', playbackChange, true);
    this.addEventListener('waiting', playbackChange, true);
    this.addEventListener('pause', playbackChange, true);

    this.addEventListener('touchstart', (event) => {
      if (event.target !== this.media) return;

      if (this === document.webkitFullscreenElement) {
        const startPos = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };

        const addGestures = (event) => {
          if (event.touches[0].clientY > startPos.y + 32) {
            controls.hide();
            startPos.y = event.touches[0].clientY;
          }

          else if (event.touches[0].clientY < startPos.y - 32) {
            controls.show();
            startPos.y = event.touches[0].clientY;
          }
        };

        // Old
        const removeEventListeners = (event) => {
          document.removeEventListener('touchmove', addGestures);
          document.removeEventListener('touchend', removeEventListeners);
        };

        document.addEventListener('touchmove', addGestures);
        document.addEventListener('touchend', removeEventListeners);
        /*
        // New
        document.addEventListener('touchmove', addGestures);
        document.addEventListener('touchend', _ => document.removeEventListener('touchmove', addGestures));
        */
      } else if (!this.immersed) {
        event.preventDefault();
        controls.timeout();
      }
    });

    this.addEventListener('click', (event) => {
      if (event.target !== this.media) return;
      this.media.paused ? this.media.play() : this.media.pause();
    });

    this.addEventListener('volumechange', (event) => {
      localStorage.setItem('vi.volume', this.media.volume);

      // Equalize every vi-player media element
      document.querySelectorAll('vi-player video, vi-player audio').forEach((media) => {
        media.volume = this.media.volume;
      });
    }, true);

  }

  get media() {
    return this.querySelector('video, audio');
  }

  get immersed() {
    return !!this.getAttribute('immersed');
  }

  set immersed(value) {
    value ? this.setAttribute('immersed', '') : this.removeAttribute('immersed');
  }

  get sublang() {
    return this.getAttribute('sublang');
  }

  set sublang(value) {
    value ? this.setAttribute('sublang', value) : this.removeAttribute('sublang');
    this.refreshTracks();
  }

  get currentQueue() {
    return this.queue.list[this.queue.index];
  }
}

document.registerElement('vi-player', HTMLViPlayerElement);
