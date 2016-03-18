'use strict';
window.vi = {
  document: document.currentScript.ownerDocument,
  component(element, callbacks = {}) {
    const proto = Object.create(HTMLElement.prototype);

    if(callbacks.created) proto.createdCallback = callbacks.created;
    if(callbacks.attached) proto.attachedCallback = callbacks.attached;
    if(callbacks.detached) proto.detachedCallback = callbacks.detached;
    if(callbacks.attrChanged) proto.attributeChangedCallback = callbacks.attrChanged;

    document.registerElement(element, {
      prototype: proto
    });
  }
}

vi.component('vi-controls');
