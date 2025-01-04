import {render, replace, remove} from '../framework/render.js';
import WaypointView from '../view/waypoint-view.js';
import EditPointView from '../view/edit-point-view.js';
import {UserAction, UpdateType} from '../const.js';
import { getOfferPrice } from '../mock/point.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointListContainer = null;
  #handleModeChange = null;
  #handleDataChange = null;

  #pointComponent = null;
  #pointEditComponent = null;
  #totalPointCost = 0;

  #point = null;
  #mode = Mode.DEFAULT;

  constructor({pointListContainer, onModeChange, onDataChange}) {
    this.#pointListContainer = pointListContainer;
    this.#handleModeChange = onModeChange;
    this.#handleDataChange = onDataChange;
  }

  init(point) {
    this.#point = point;
    this.#totalPointCost = this.#point.basePrice;
    for (const offerId of this.#point.offers) {
      this.#totalPointCost += getOfferPrice(this.#point.type, offerId);
    }

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    this.#pointComponent = new WaypointView({
      point: this.#point,
      onEditClick: () => {
        this.#replacePointToForm();
      },
      onFavoriteClick: this.#handleFavoriteClick});

    this.#pointEditComponent = new EditPointView({
      point: this.#point,
      onFormSubmit: this.#handleFormSubmit,
      onButtonClick: () => {
        this.#pointEditComponent.reset(this.#point);
        this.#replaceFormToPoint();
      },
      onDeleteClick: this.#handleDeleteClick,
    });

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    // Проверка на наличие в DOM необходима,
    // чтобы не пытаться заменить то, что не было отрисовано
    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  get totalPointCost() {
    return this.#totalPointCost;
  }

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      {...this.#point, isFavorite: !this.#point.isFavorite},
    );
  };

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  #replacePointToForm() {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#pointEditComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #handleFormSubmit = (point) => {
    // Проверяем, поменялись ли в задаче данные, которые попадают под фильтрацию,
    // а значит требуют перерисовки списка - если таких нет, это PATCH-обновление
    // todo!!!
    // const isMinorUpdate =
    //   !isDatesEqual(this.#point.dueDate, update.dueDate) ||
    //   isTaskRepeating(this.#point.repeating) !== isTaskRepeating(update.repeating);

    // this.#handleDataChange(
    //   UserAction.UPDATE_TASK,
    //   isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
    //   update,
    // );
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      point,
    );
    this.#replaceFormToPoint();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#pointEditComponent.reset(this.#point);
      this.#replaceFormToPoint();
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };

  #handleDeleteClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MAJOR,
      point,
    );
  };
}
