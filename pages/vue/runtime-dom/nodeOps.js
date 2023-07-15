export const nodeOps = {
  querySelector: (selector) => document.querySelector(selector),
  // 元素
  createElement: (tagName) => document.createElement(tagName),
  remove: (child) => {
    const parentNode = child.parentNode;

    if (parentNode) {
      parentNode.removeChild(child);
    }
  },
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor);
  },
  setElementText: (el, text) => (el.textContent = text),
  // 文本
  createText: (text) => document.createTextNode(text),
  setText: (node, text) => (node.nodeValue = text),
};
