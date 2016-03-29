'use strict';

vi.component('vi-player', {
  created() {
    /** 
     * PUBLIC STUFF
     */

    Object.defineProperty(this, 'media', {
      get() {
        return this.querySelector('video, audio');
      }
    });

    if(!this.media) this.insertBefore(document.createElement('video'), this.firstChild);

    const sourcechangeEvent = new Event('sourcechange');

    this.playlist = {
      list: [],
      index: -1,
    };

    this.playlist.add = (...args) => {
      Array.from(args).forEach((item) => {
        this.playlist.list.push(item);
      });
      if(!this.media.src) this.playlist.change();
    }

    this.playlist.change = (i) => {
      if(!this.playlist.list.length) return;

      const current = this.playlist.index;
      const last = this.playlist.list.length - 1;
      const next = (i !== undefined) ? i : (current >= last) ? 0 : current + 1;
      
      this.media.src = this.playlist.list[next].src;
      this.media.play().catch((err) => {
        // Do something
      });

      Array.from(this.media.querySelectorAll('track')).forEach((track) => {
        track.remove();
      });

      for(const lang in this.playlist.list[next].subtitles) {
        const track = document.createElement('track');
        track.srclang = lang;
        track.src = this.playlist.list[next].subtitles[lang];
        if(lang === 'en') track.default = true;
        this.media.appendChild(track);
      }

      this.playlist.index = next;
      this.dispatchEvent(sourcechangeEvent);
      iterateControls((item, attr, tag) => {
        if(tag === 'VI-BUTTON') {
          switch(attr) {
            case 'next':
              if(next === last) item.status = 'go-first';
              else item.status = 'next';
          }
        } else if(tag === 'VI-VIEW') {
          switch(attr) {
            case 'index': 
              item.textContent = next + 1;
              break;

            case 'title':
              item.textContent = this.playlist.list[next].title || `Media #${this.playlist.index + 1}`;
              break;
          }
        }
      })
    }

    this.fullscreen = () => {
      if(this === document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      } else {
        this.webkitRequestFullscreen();
      }
    }

    /** 
     * PRIVATE STUFF
     */

    const iterateControls = (callback) => {
      const controls = this.querySelectorAll('vi-view, vi-button, vi-slider');
      for(let i = 0; i < controls.length; i++) {
        const item = controls[i];
        const tag = controls[i].tagName;
        const attr = controls[i].getAttribute('of') || controls[i].getAttribute('track') || controls[i].getAttribute('action');

        callback(item, attr, tag);
      }
    }

    const timestamp = (number) => {  
      const h = Math.floor((number / 60 / 60) % 60);
      const m = Math.floor((number / 60) % 60);
      const s = Math.floor(number % 60);

      const pad = (n) => n<10?'0'+n:n;

      if(this.media.duration > 3600)
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
      else
        return `${pad(m)}:${pad(s)}`;
    }

    /** 
     * EVENT LISTENERS
     */

    this.addEventListener('loadedmetadata', (e) => {
      e.target.volume = 0;
      e.target.volume = localStorage.getItem('vi.volume') || 1;
    }, true);

    let immerse;
    const showControls = () => {
      this.classList.remove('immersed');
      this.immersed = false;

      clearTimeout(immerse);
      immerse = setTimeout(() => {
        if(!this.media.paused) {
          this.classList.add('immersed');
          this.immersed = true;
        }
      }, 2000);
    }

    this.addEventListener('mousemove', showControls);
    this.addEventListener('canplay', showControls, true);

    const playbackChange = (e) => {
      if(e.target !== this.media) return;
      this.setAttribute('playback-status', e.type);
      iterateControls((item, attr, tag) => {
        switch(e.type) {
          case 'play':
            if(attr === 'play') item.status = 'pause';
            break;

          case 'playing':
            if(attr === 'playback-status') item.status = 'play';
            break;

          case 'waiting':
            if(attr === 'playback-status') item.status = 'wait';
            break;

          case 'pause':
            if(attr === 'play') item.status = 'play';
            if(attr === 'playback-status') item.status = 'pause';
            break;
        }
      });
    }

    this.addEventListener('play', playbackChange, true);
    this.addEventListener('playing', playbackChange, true);
    this.addEventListener('waiting', playbackChange, true);
    this.addEventListener('pause', playbackChange, true);

    this.addEventListener('touchstart', (e) => {
      if(this.immersed) {
        e.preventDefault();
        showControls();
      }
    })

    this.addEventListener('click', (e) => {
      switch(e.target.tagName) {
        case 'VIDEO':
          if(e.target !== this.media) return;
          this.media.paused ? this.media.play() : this.media.pause();
          break;

        case 'VI-BUTTON':
          switch(e.target.getAttribute('action')) {
            case 'play':
              this.media.paused ? this.media.play() : this.media.pause();
              break;

            case 'next':
              this.playlist.change();
              break;

            case 'fullscreen':
              this.fullscreen();
              break;
          }
          break;
      }
    });

    this.addEventListener('dragstart', (e) => {
      switch(e.target.getAttribute('track')) {
        case 'current-time':
          this.media.pause();
          break;

        case 'volume':
          this.media.volume = e.target.value;
          break;
      }
    }, true);

    this.addEventListener('dragmove', (e) => {
      switch(e.target.getAttribute('track')) {
        case 'volume':
          this.media.volume = e.target.value;
          break;
      }
    }, true);

    this.addEventListener('dragend', (e) => {
      switch(e.target.getAttribute('track')) {
        case 'current-time':
          if(!this.media.duration) {
            this.media.play();
            return;
          }
          this.media.currentTime =  (this.media.duration) * e.target.value;
          this.media.play();
          break;
      }
    }, true);

    this.addEventListener('durationchange', (e) => {
      if(e.target !== this.media) return;
      iterateControls((item) => {
        if(item.getAttribute('of') === 'duration') item.textContent = timestamp(this.media.duration);
      });
    }, true);

    this.addEventListener('timeupdate', (e) => {
      if(e.target !== this.media) return;
      iterateControls((item) => {
        const attrOf = item.getAttribute('of');
        const attrTrack = item.getAttribute('track');

        if(attrOf !== 'current-time' && attrTrack !== 'current-time') return;

        switch(item.tagName) {
          case 'VI-VIEW':
            item.textContent = timestamp(this.media.currentTime);
            break;

          case 'VI-SLIDER':
            if(!item.dragging) item.value = this.media.currentTime / this.media.duration;
            break;
        }
      });
    }, true);

    this.addEventListener('volumechange', (e) => {
      if(e.target !== this.media) return;
      localStorage.setItem('vi.volume', Math.max(0.001, this.media.volume));

      iterateControls((item, attr, tag) => {
        if(attr !== 'volume') return;
        switch(tag) {
          case 'VI-VIEW':
            const n = Math.floor(this.media.volume * 100);
            item.textContent = n<10?'0'+n:n;
            break;

          case 'VI-SLIDER':
            if(!item.dragging) item.value = this.media.volume;
            break;
        }
      });
    }, true);

  }
});
