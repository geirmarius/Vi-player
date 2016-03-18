vi.component('vi-button', {
  created() {
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
        status = value;
        if(shadow.querySelector(`#${value}`)) {
          shadow.querySelector('use').setAttribute('href', `#${value}`);
        } else {
          shadow.querySelector('use').setAttribute('href', '#not-found');
        }
      }
    });

    this.status = this.getAttribute('action');
  },

  attrChanged(attr, prev, current) {
    if(attr === 'action') this.status = current;
  }
});
