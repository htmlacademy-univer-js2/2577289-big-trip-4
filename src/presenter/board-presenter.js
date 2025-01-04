import EventListView from '../view/event-list-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import TripInfoView from '../view/trip-info-view.js';
import { render, RenderPosition, remove } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import EmptyListView from '../view/empty-list-view.js';
import { SortType, UserAction, UpdateType, FilterType } from '../const.js';
import { sortDateDown, sortPriceDown, sortTimeDown } from '../utils/point.js';

export default class BoardPresenter {
  #sortComponent = null;
  #infoComponent = new TripInfoView(0);
  #filterComponent = new FilterView();
  #eventListComponent = new EventListView();
  #noPointComponent = null;
  #container = null;
  #header = null;
  #pointsModel = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;

  #currentSortType = SortType.DATE_DOWN;
  #currentFilterType = FilterType.EVERYTHING;

  constructor({ container, header, pointsModel, onNewPointDestroy }) {
    this.#container = container;
    this.#header = header;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);

    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy,
    });
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

  get totalCost() {
    let summ = 0;
    for (const pointPresenter of this.#pointPresenters.values()) {
      summ += pointPresenter.totalPointCost;
    }
    return summ;
  }

  #handlePointChange = (updatedPoint) => {
    // Здесь будем вызывать обновление модели todo
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  createPoint() {
    this.#currentSortType = SortType.DATE_DOWN; //todo?
    //this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.ALL);
    this.#newPointPresenter.init();
  }

  #renderNoPoints() {
    this.#noPointComponent = new EmptyListView({
      message: this.#currentFilterType,
    });
    render(this.#noPointComponent, this.#container);
  }

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
    //render(this.#infoComponent, this.#header, RenderPosition.AFTERBEGIN);
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
    if (this.#pointPresenters.size === 0) {
      this.#renderNoPoints();
    }
    this.#infoComponent.totalCost = this.totalCost;
    console.log(this.#infoComponent.totalCost, this.totalCost);
    render(this.#infoComponent, this.#header, RenderPosition.AFTERBEGIN);
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
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #clearBoard({ resetSortType = false } = {}) {

    this.#newPointPresenter.destroy();

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#noPointComponent);
    remove(this.#infoComponent);

    if (resetSortType) {
      this.#currentSortType = SortType.DATE_DOWN;
    }
  }

}
