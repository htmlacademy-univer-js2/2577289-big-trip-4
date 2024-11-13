import {createElement} from '../render.js';
import {createCreatePointTemplate} from '../template/create-point-template.js';

export default class CreatePointView {
  getTemplate() {
    return createCreatePointTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
