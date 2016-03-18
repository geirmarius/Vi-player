vi.component('vi-slider-handle');
vi.component('vi-slider', {
  created() {
    // Create slider handler
    const handle = document.createElement('vi-slider-handle');
    this.appendChild(handle);

    Object.defineProperty(this, 'value', {
      get() {
        if(this.hasAttribute('exponential'))
          return Math.pow(this.getAttribute('value'), 2);
        else
          return this.getAttribute('value');
      },
      set(value) {
        let newValue = Math.min(1, Math.max(0, value));
        if(this.hasAttribute('exponential')) newValue = Math.sqrt(newValue);
        
        this.setAttribute('value', newValue);
        handle.style.width = `${newValue * 100}%`;
      }
    });

    this.dragging = false;
    this.value = 0;

    const calc = (e, r) => {
      const sliderOffset = this.getBoundingClientRect().left;
      const pointerPos = (e.touches === undefined) ? e.clientX : e.touches[0].clientX;
      const position = (pointerPos - sliderOffset) / this.clientWidth;
      const percentage = Math.min(1, Math.max(0, position));
      if(r) return percentage;
      this.value = this.hasAttribute('exponential') ? Math.pow(percentage, 2) : percentage;
    }
    
    // Drag hover
    const hoverEvent = new Event('draghover');
    const hover = (e) => {
      if(e.touches || this.dragging) return;
      this.dispatchEvent(hoverEvent);
    }
    
    this.addEventListener('mousemove', hover);

    // Start dragging
    const startEvent = new Event('dragstart');
    const start = (e) => {
      this.dragging = true;
      calc(e);
      this.dispatchEvent(startEvent);

      document.addEventListener('touchmove', move);
      document.addEventListener('mousemove', move);

      document.addEventListener('touchend', end);
      document.addEventListener('mouseup', end);
    };

    this.addEventListener('touchstart', start);
    this.addEventListener('mousedown', start);

    // Dragging
    const moveEvent = new Event('dragmove');
    const move = (e) => {
      if(!this.dragging) return;
      e.preventDefault();
      calc(e);
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

      document.removeEventListener('touchend', end);
      document.removeEventListener('mouseup', end);
    };
  }
});
