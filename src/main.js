import PointsModel from './model/points-model.js';
import BoardPresenter from './presenter/board-presenter.js';
//import FilterModel from './model/filter-model.js';
import NewPointButtonView from './view/new-point-button-view.js';
import {render} from './framework/render.js';

const bodyElement = document.querySelector('body');
const headerElement = bodyElement.querySelector('.page-header');
const tripInfoElement = headerElement.querySelector('.trip-main');
// const filterElement = tripInfoElement.querySelector('.trip-controls__filters');
const mainElement = bodyElement.querySelector('.page-main');
const eventListElement = mainElement.querySelector('.trip-events');

const pointsModel = new PointsModel();
//const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({
  container: eventListElement,
  header: tripInfoElement,
  pointsModel: pointsModel,
  onNewPointDestroy: handleNewPointFormClose,
});

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewPointButtonClick
});

function handleNewPointButtonClick() {
  boardPresenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}

function handleNewPointFormClose() {
  newPointButtonComponent.element.disabled = false;
}

render(newPointButtonComponent, tripInfoElement);

boardPresenter.init();
