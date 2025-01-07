import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #pointsApiService = null;
  #destinationsApiService = null;
  #offersApiService = null;
  #points = [];
  #destinations = [];
  #offers = [];

  constructor({ pointsApiService, destinationsApiService, offersApiService }) {
    super();
    this.#pointsApiService = pointsApiService;
    this.#destinationsApiService = destinationsApiService;
    this.#offersApiService = offersApiService;
  }

  async init() {
    const [destinations, offers, points] = await Promise.all([
      this.#destinationsApiService.destinations.catch(() => []),
      this.#offersApiService.offers.catch(() => []),
      this.#pointsApiService.points.catch(() => []),
    ]);

    this.#destinations = destinations;
    this.#offers = offers;
    this.#points = points.map(this.#adaptPointToClient);

    this._notify(UpdateType.INIT);
  }

  #adaptPointToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }

  async updatePoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptPointToClient(response);
      const index = this.#points.findIndex((point) => point.id === updatedPoint.id);
      if (index === -1) {
        throw new Error('Can\'t update unexisting point');
      }
      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1),
      ];

      this._notify(updateType, updatedPoint);
    } catch (err) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = this.#adaptPointToClient(response);
      this.#points = [
        newPoint,
        ...this.#points,
      ];
      this._notify(updateType, newPoint);
    } catch (err) {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    try {
      await this.#pointsApiService.deletePoint(update);
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete point');
    }

  }
}
