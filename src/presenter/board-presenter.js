import EventListView from '../view/event-list-view.js';
import SortView from '../view/sort-view.js';
import TripInfoView from '../view/trip-info-view.js';
import LoadingView from '../view/loading-view.js';
import { render, RenderPosition, remove } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import FilterPresenter from './filter-presenter.js';
import EmptyListView from '../view/empty-list-view.js';
import { filter } from '../utils/filter.js';
import { SortType, UserAction, UpdateType, FilterType } from '../const.js';
import { sortDateDown, sortPriceDown, sortTimeDown, getDestinationNameById } from '../utils/point.js';

export default class BoardPresenter {
  #sortComponent = null;
  #infoComponent = new TripInfoView(0, []);
  #eventListComponent = new EventListView();
  #loadingComponent = new LoadingView();
  #noPointComponent = null;
  #container = null;
  #header = null;
  #pointsModel = null;
  #filterModel = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #filterPresenter = null;
  #isLoading = true;

  #onNewPointDestroy = null;

  #currentSortType = SortType.DATE_DOWN;

  constructor({ container, header, pointsModel, filterModel, onNewPointDestroy }) {
    this.#container = container;
    this.#header = header;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#onNewPointDestroy = onNewPointDestroy;
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    // this.#newPointPresenter = new NewPointPresenter({
    //   pointListContainer: this.#eventListComponent.element,
    //   onDataChange: this.#handleViewAction,
    //   onDestroy: onNewPointDestroy,
    //   destinations: this.#pointsModel.destinations,
    //   allOffers: this.#pointsModel.offers,
    // });

    this.#filterPresenter = new FilterPresenter({
      filterContainer: this.#header,
      filterModel,
      pointsModel,
    });
  }

  init() {
    this.#renderBoard();
    this.#filterPresenter.init();
  }

  get points() {
    const filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[filterType](points);

    switch (this.#currentSortType) {
      case SortType.DATE_DOWN:
        return filteredPoints.sort(sortDateDown);
      case SortType.PRICE_DOWN:
        return filteredPoints.sort(sortPriceDown);
      case SortType.TIME_DOWN:
        return filteredPoints.sort(sortTimeDown);
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

  getCities() {
    const res = [];
    for (const point of this.#pointsModel.points) {
      res.push(getDestinationNameById(this.#pointsModel.destinations, point.destination));
    }
    return res;
  }

  // #handlePointChange = (updatedPoint) => {   --удалить???
  //   // Здесь будем вызывать обновление модели todo
  //   this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  // };

  createPoint() {
    this.#currentSortType = SortType.DATE_DOWN;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter.init();
  }

  #renderNoPoints() {
    this.#noPointComponent = new EmptyListView({
      filterType: this.#filterModel.filter,
    });
    render(this.#noPointComponent, this.#container);
  }

  #renderSort() {
    if (this.#sortComponent !== null) {
      remove(this.#sortComponent);
    }
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
      destinations: this.#pointsModel.destinations,
      allOffers: this.#pointsModel.offers,
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
    // if (this.#sortComponent !== null) {
    //   remove(this.#sortComponent);
    //   this.#renderSort();
    // }
    this.#renderSort();

    this.#renderBoardList();
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }
    if (this.#pointPresenters.size === 0) {
      this.#renderNoPoints(this.#filterModel.filter);
    }
    this.#infoComponent.totalCost = this.totalCost;
    this.#infoComponent.cities = this.getCities();
    render(this.#infoComponent, this.#header, RenderPosition.AFTERBEGIN);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#container);
  }

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
      case UpdateType.INIT:
        this.#newPointPresenter = new NewPointPresenter({
          pointListContainer: this.#eventListComponent.element,
          onDataChange: this.#handleViewAction,
          onDestroy: this.#onNewPointDestroy,
          destinations: this.#pointsModel.destinations,
          allOffers: this.#pointsModel.offers,
        });
        this.#isLoading = false;
        remove(this.#loadingComponent);
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
    remove(this.#infoComponent);
    //remove(this.#filterComponent);
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
    }

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DATE_DOWN;
    }
  }

}
