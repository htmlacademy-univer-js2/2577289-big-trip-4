import CreatePointView from './view/create-point-view.js';
import EditPointView from './view/edit-point-view.js';
import EventListView from './view/event-list-view.js';
import FilterView from './view/filter-view.js';
import SortView from './view/sort-view.js';
import WaypointView from './view/waypoint-view.js';

import {render} from './render.js';
import BoardPresenter from './presenter/board-presenter.js';

/*const siteMainElement = document.querySelector('.main');
const siteHeaderElement = siteMainElement.querySelector('.main__control');
const boardPresenter = new BoardPresenter({boardContainer: siteMainElement});

render(new FilterView(), siteHeaderElement);
render(new SortView(), siteMainElement);

render(new EventListView(), siteMainElement);
render(new CreatePointView(), siteMainElement);
render(new EditPointView(), siteMainElement);
render(new WaypointView(), siteMainElement);

boardPresenter.init();*/


const bodyElement = document.querySelector('body');
const headerElement = bodyElement.querySelector('.page-header');
const tripInfoElement = headerElement.querySelector('.trip-main');
const filterElement = tripInfoElement.querySelector('.trip-controls__filters');
const mainElement = bodyElement.querySelector('.page-main');
const eventListElement = mainElement.querySelector('.trip-events');

const boardPresenter = new BoardPresenter({
container: eventListElement,
header: tripInfoElement
});

boardPresenter.init();