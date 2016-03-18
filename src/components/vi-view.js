vi.component('vi-view', {
  created() {
    this.reset = () => {
      switch(this.getAttribute('of')) {
        case 'duration':
        case 'current-time':
          this.textContent = '00:00';
          break;

        case 'index':
          this.textContent = '0';
          break;

        case 'volume':
          this.textContent = '00';
          break;

        case 'playback-status':
          const shadow = this.attachShadow({
            mode: 'closed'
          });
          shadow.innerHTML = document.importNode(vi.document.querySelector('svg'), true).outerHTML;

          let status;
          Object.defineProperty(this, 'status', {
            get() {
              return status;
            },

            set(value) {
              if(shadow.querySelector(`#${value}`)) {
                shadow.querySelector('use').setAttribute('href', `#${value}`);
              } else {
                shadow.querySelector('use').setAttribute('href', '#not-found');
              }
            }
          });
          break;

        default:
          this.textContent = 'N/A';
          break;
      }
    }

    this.reset();
  },

  attrChanged(attr) {
    if(attr === 'of') this.reset();
  }
});
