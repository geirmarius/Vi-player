'use strict';

class HTMLViSliderElement extends HTMLElement {
  constructor() {
    super();

    this.exponential = this.hasAttribute('exponential');
    this.dragging = false;

    let sliderValue = this.getAttribute('value') || 0;

    // Create slider handler
    // Preview not in use yet
    const handle = document.createElement('vi-slider-handle');
    const preview = document.createElement('div');
    this.appendChild(handle);
    this.appendChild(preview);

    Object.defineProperty(this, 'value', {
      get() {
        if(this.exponential)
          return Math.pow(sliderValue, 2);
        else
          return sliderValue;
      },
      set(value) {
        let newValue = Math.min(Math.max(value, 0), 1);
        if(this.exponential)
          newValue = Math.sqrt(newValue);

        sliderValue = newValue;
        handle.style.width = `${newValue * 100}%`;
      }
    });

    const calc = (event, r) => {
      const sliderOffset = this.getBoundingClientRect().left;
      const pointerPos = (event.touches === undefined) ? event.clientX : event.touches[0].clientX;
      const position = (pointerPos - sliderOffset) / this.clientWidth;
      const percentage = Math.min(Math.max(position, 0), 1);
      if(r) return percentage;
      this.value = this.exponential ? Math.pow(percentage, 2) : percentage;
    }

    // Drag hover
    const hoverEvent = new Event('draghover');
    const hover = (e) => {
      if (e.touches || this.dragging) return;
      this.dispatchEvent(hoverEvent);
      preview.style.width = `${calc(event, true) * 100}%`;
    }

    this.addEventListener('mousemove', hover);

    // Start dragging
    const startEvent = new Event('dragstart');
    const start = (e) => {
      this.dragging = true;
      calc(e);
      this.dispatchEvent(startEvent);

      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('mousemove', move, { passive: false });

      document.addEventListener('touchend', end, { once: true });
      document.addEventListener('mouseup', end, { once: true });
    };

    this.addEventListener('touchstart', start);
    this.addEventListener('mousedown', start);

    // Dragging
    const inputEvent = new Event('input');
    const moveEvent = new Event('dragmove');
    const move = (e) => {
      if(!this.dragging) return;
      e.preventDefault();
      calc(e);
      this.dispatchEvent(inputEvent);
      this.dispatchEvent(moveEvent);
    };

    // Stop dragging
    const endEvent = new Event('dragend');
    const end = (e) => {
      if(!this.dragging) return;

      this.dragging = false;
      this.dispatchEvent(endEvent);

      document.removeEventListener('touchmove', move);
      document.removeEventListener('mousemove', move);
    };
  }
}

customElements.define('vi-slider', HTMLViSliderElement);

{
  function drag(event) {
    if (!event) {
      this.value = 0;
      return;
    }

    const media = vi.u.findPlayer(event).media;

    switch(event.type) {
      case 'dragstart':
        media.pause();

      case 'input':
        media.currentTime = this.value * media.duration;
        break;

      case 'dragend':
        media.play().catch(() => {});
        break;
    }

  }

  vi.for('seeker').on('dragstart', drag);
  vi.for('seeker').on('input', drag);
  vi.for('seeker').on('dragend', drag);

  function updatetime(event) {
    if (!event) return;
    const loop = () => {
      this.value = event.target.currentTime / event.target.duration;
      if (!event.target.paused) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  vi.on('play', updatetime, true).for('seeker');
  vi.on('seeking', updatetime, true).for('seeker');
}

{
  /** Volume slider */
  function setVolume(event) {
    if (!event) {
      this.value = 0;
      return;
    }

    const media = vi.u.findPlayer(event).media;
    media.muted = false;
    media.volume = this.value;
  }

  vi.for('volume-knob').on('dragstart', setVolume);
  vi.for('volume-knob').on('input', setVolume);

  vi.on('volumechange', function(event) {
    if (!event) return;
    this.value = event.target.muted ? 0 : event.target.volume;
  }, true).for('volume-knob');
}
