import EventListView from '../view/event-list-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import TripInfoView from '../view/trip-info-view.js';
import {render, RenderPosition, remove} from '../framework/render.js';
import PointPresenter from './point-presenter.js';
//import { getEmptyPoint } from '../mock/point.js';
import {SortType, UserAction, UpdateType} from '../const.js';
import { sortDateDown, sortPriceDown, sortTimeDown } from '../utils/point.js';

export default class BoardPresenter {
  #sortComponent = null;
  #infoComponent = new TripInfoView();
  #filterComponent = new FilterView();
  #eventListComponent = new EventListView();
  #container = null;
  #header = null;
  #pointsModel = null;
  #pointPresenters = new Map();

  #currentSortType = SortType.DATE_DOWN;

  constructor({container, header, pointsModel}) {
    this.#container = container;
    this.#header = header;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#renderBoard();
  }

  get points() {
    switch (this.#currentSortType) {
      case SortType.DATE_DOWN:
        return [...this.#pointsModel.points].sort(sortDateDown);
      case SortType.PRICE_DOWN:
        return [...this.#pointsModel.points].sort(sortPriceDown);
      case SortType.TIME_DOWN:
        return [...this.#pointsModel.points].sort(sortTimeDown);
    }
    return this.#pointsModel.points;
  }

  #handlePointChange = (updatedPoint) => {
    // Здесь будем вызывать обновление модели todo
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#container);
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onModeChange: this.#handleModeChange,
      onDataChange: this.#handleViewAction,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderPoints() {
    this.points
      .forEach((point) => this.#renderPoint(point));
  }

  #renderBoardList() {
    render(this.#eventListComponent, this.#container);
    this.#renderPoints();
  }

  #renderBoard() {
    render(this.#infoComponent, this.#header, RenderPosition.AFTERBEGIN);
    render(this.#filterComponent, this.#header);
    // todo!
    // const tasks = this.tasks;
    // const taskCount = tasks.length;

    // if (taskCount === 0) {
    //   this.#renderNoTasks();
    //   return;
    // }
    this.#renderSort();
    this.#renderBoardList();
  }

  // #clearPointList() {
  //   this.#pointPresenters.forEach((presenter) => presenter.destroy());
  //   this.#pointPresenters.clear();
  // }

  // #sortPoints(sortType) {
  //   switch (sortType) {
  //     case SortType.DATE_DOWN:
  //       this.points.sort(sortDateDown);
  //       break;
  //     case SortType.TIME_DOWN:
  //       this.points.sort(sortTimeDown);
  //       break;
  //     case SortType.PRICE_DOWN:
  //       this.points.sort(sortPriceDown);
  //       break;
  //   }
  //   this.#currentSortType = sortType;
  // }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters?.get(data.id)?.init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #clearBoard({resetSortType = false} = {}) {

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    //remove(this.#noPointComponent);

    if (resetSortType) {
      this.#currentSortType = SortType.DATE_DOWN;
    }
  }

}
