vi.component('vi-playback-status', {
  created() {
    const shadow = this.attachShadow({
      mode: 'closed'
    });
    shadow.innerHTML = document.importNode(vi.document.querySelector('svg'), true).outerHTML;
  },

  attrChanged(attr, prev, current) {
    switch(attr) {
      case 'status':
        if(shadow.querySelector(`#${current}`)) {
          shadow.querySelector('use').setAttribute('href', `#${current}`);
          console.log(shadow.querySelector('use'))
        } else {
          shadow.querySelector('use').setAttribute('href', '#not-found');
        }
        break;
    }
  }
});
