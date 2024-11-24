import {createEditPointTemplate} from '../template/edit-point-template.js';
import AbstractView from '../framework/view/abstract-view.js';
import { getEmptyPoint } from '../mock/point.js';

export default class CreatePointView extends AbstractView {
  get template() {
    return createEditPointTemplate(getEmptyPoint());
  }
}
