'use strict';

window.vi = {
  document: document.currentScript.ownerDocument,

  _plEventPool: [],
  _elEventPool: [],

  on(eventType, fn, options) {
    const uninitialized = {
      connections: [],
      eventType,
      fn,
      options,
      for(reference) {
        vi._plEventPool.push({
          connections: uninitialized.connections,
          eventType,
          fn,
          options,
          reference,
        });

        document.querySelectorAll('vi-controls').forEach((controller) => {
          if (controller.constructor === HTMLElement)
            customElements.whenDefined('vi-controls').then(() => controller.update(reference));
          else
            controller.update(reference);
        });
      }
    };

    return uninitialized;
  },

  for(reference) {
    const uninitialized = {
      reference,
      on(eventType, fn, options) {
        vi._elEventPool.push({
          eventType,
          fn,
          options,
          reference,
        });

        document.querySelectorAll('vi-controls').forEach((controller) => {
          if (controller.constructor === HTMLElement)
            customElements.whenDefined('vi-controls').then(() => controller.update);
          else
            controller.update();
        });
      }
    }

    return uninitialized;
  },

  utilities: {
    findPlayer(event) {
      return event.path.find(node => node.tagName === 'VI-PLAYER');
    },

    timestamp(number = 0) {
      if (!Number.isFinite(number)) number = 0;

      const h = Math.floor((number / 60 / 60) % 60);
      const m = Math.floor((number / 60) % 60);
      const s = Math.floor(number % 60);

      const pad = n => n < 10 ? '0' + n : n;

      if (number > 3600)
        return `${h}:${pad(m)}:${pad(s)}`;
      else
        return `${pad(m)}:${pad(s)}`;
    }
  },
};

/** Aliases */
vi.u = vi.utilities;

vi.on('timeupdate', function(event) {
  if (!event) {
    this.textContent = vi.u.timestamp();
    return;
  }

  this.textContent = vi.u.timestamp(event.target.currentTime);
}, true).for('current-time');

vi.on('timeupdate', function(event) {
  if (!event) {
    this.textContent = vi.u.timestamp();
    return;
  }

  this.textContent = vi.u.timestamp(Math.ceil(event.target.duration - event.target.currentTime));
}, true).for('remaining-time');

vi.on('durationchange', function(event) {
  if (!event) {
    this.textContent = vi.u.timestamp();
    return;
  }

  this.textContent = vi.u.timestamp(event.target.duration);
}, true).for('duration');

vi.on('volumechange', function(event) {
  if (!event) {
    this.textContent = '00';
    return;
  }

  const pad = n => n < 10 ? '00' + n : n < 100 ? '0' + n : n;
  this.textContent = event.target.muted ? `${pad(0)}%` : `${pad(Math.floor(event.target.volume * 100))}%`;
}, true).for('volume-level');

vi.on('sourcechange', function(event) {
  if (!event) {
    this.textContent = 0;
    return;
  }

  this.textContent = event.target.queue.index;
}).for('queue-index');