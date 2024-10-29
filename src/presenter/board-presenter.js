import CreatePointView from '../view/create-point-view.js';
import EditPointView from '../view/edit-point-view.js';
import EventListView from '../view/event-list-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import WaypointView from '../view/waypoint-view.js';
import TripInfoView from '../view/trip-info-view.js';
import {render, RenderPosition} from '../render.js';

export default class BoardPresenter {
  sortComponent = new SortView();
  infoComponent = new TripInfoView();
  filterComponent = new FilterView();
  eventListComponent = new EventListView();
  
  constructor({container, header}) {
    this.container = container;
    this.header = header;
  }
  
  init() {
    render(this.infoComponent, this.header, RenderPosition.AFTERBEGIN);
    render(this.filterComponent, this.header);
    render(this.sortComponent, this.container);
    render(this.eventListComponent, this.container);
    render(new EditPointView(), this.eventListComponent.getElement());
    for (let i = 0; i < 3; i++) {
      render(new WaypointView(), this.eventListComponent.getElement());
    }
  }
}