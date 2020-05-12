class Control {
  
  constructor(parentNode, tagName, className, textContent, click, fromParent) {
    const classNameV = className || '';
    const textContentV = textContent || '';
    const tagNameV = tagName || 'div';
    this.isDisabled = false;
    this.isHidden = false;

    if (!fromParent) {
      this.node = document.createElement(tagNameV);
      parentNode.appendChild(this.node);
      this.node.className = classNameV;
      this.node.textContent = textContentV;
    } else {
      this.node = parentNode;
      this.node.className = classNameV;
    }

    if (click) {
      this.click = click;
      this.node.addEventListener('click', (e) => {
        if (!this.isDisabled) {
          this.click(e);
        }
      });
    }
  }

  clear() {
    this.node.innerHTML = '';
  }

  hide() {
    this.isHidden = true;
    this.node.style = 'display:none';
  }

  show() {
    this.isHidden = false;
    this.node.style = '';
  }

  animate(animationCssClass, inlineStyle) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (animationCssClass) {
          this.node.className = animationCssClass;
        }
        if (inlineStyle) {
          this.node.style = inlineStyle;
        }
      });
    });
  }
}

module.exports = Control;
