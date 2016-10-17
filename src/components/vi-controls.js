'use strict';

class HTMLViControlsElement extends HTMLElement {
  constructor() {
    super();

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE || !node.dataset.viid) return;
          this.addListener(node);
        });

        mutation.removedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE || !node.dataset.viid) return;
          this.removeListener(node);
        });

        if (mutation.attributeName) {
          this.removeListener(mutation.target, mutation.oldValue);
          this.addListener(mutation.target);
        }
      });
    }).observe(this, {
      childList: true,
      subtree: true,
      attributeFilter: ['data-viid'],
      attributes: true,
      attributeOldValue: true,
    });
  }

  connectedCallback() {
    let parent = this.parentElement;
    while(parent.tagName !== 'VI-PLAYER') {
      if (parent.tagName === 'BODY') {
        parent = undefined;
        break;
      }
      parent = parent.parentElement;
    }

    this.playerParent = parent;
    this.update();
  }

  disconnectedCallback() {
    this.playerParent = undefined;
  }

  update() {
    this.querySelectorAll('*').forEach((node) => {
      if (!node.dataset.viid) return;
      this.addListener(node);
    });
  }

  addListener(node) {
    const plEventPool = vi._plEventPool.filter((item) => item.reference === node.dataset.viid);
    const elEventPool = vi._elEventPool.filter((item) => item.reference === node.dataset.viid);

    plEventPool.forEach((item) => {
      let connection = item.connections.find((found) => found.node === node);

      if (!connection) {
        const length = item.connections.push({ node, listener: item.fn.bind(node) });
        connection = item.connections[length - 1];

        this.playerParent.addEventListener(item.eventType, connection.listener, item.options);
        item.fn.call(node);
      }
    });

    elEventPool.forEach((item) => {
      node.addEventListener(item.eventType, item.fn, item.options);
      item.fn.call(node);
    });
  }

  removeListener(node, oldValue) {
    const plEventPool = vi._plEventPool.filter((item) => item.reference === oldValue || node.dataset.viid);
    const elEventPool = vi._elEventPool.filter((item) => item.reference === oldValue || node.dataset.viid);

    plEventPool.forEach((item) => {
      let connection = item.connections.find((found) => found.node === node);

      if (connection) {
        const index = item.connections.indexOf(connection);
        this.playerParent.removeEventListener(item.eventType, connection.listener, item.options);
        item.connections.splice(index, 1);
      }
    });

    elEventPool.forEach((item) => {
      node.removeEventListener(item.eventType, item.fn, item.options);
    });
  }
}

customElements.define('vi-controls', HTMLViControlsElement);