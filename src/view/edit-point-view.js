import { createEditPointTemplate } from '../template/edit-point-template.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { findOffersByType, findDestinationId, getEmptyPoint } from '../utils/point.js';
import flatpickr from 'flatpickr';

import 'flatpickr/dist/flatpickr.min.css';

export default class EditPointView extends AbstractStatefulView {
  #handleFormSubmit = null;
  #handleButtonClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #handleDeleteClick = null;

  constructor({ point = getEmptyPoint(), onFormSubmit, onButtonClick, onDeleteClick }) {
    super();
    this._setState(EditPointView.parsePointToState({ point }));
    this.#handleFormSubmit = onFormSubmit;
    this.#handleButtonClick = onButtonClick;
    this.#handleDeleteClick = onDeleteClick;
    this._restoreHandlers();
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  get template() {
    return createEditPointTemplate({ state: this._state });
  }

  _restoreHandlers() {
    this.element.querySelector('form') // event /+ event--edit
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#buttonClickHandler);

    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);

    // this.element.querySelector('.card__delete')
    //   .addEventListener('click', this.#formDeleteClickHandler);
    this.element.querySelector('form') // event /+ event--edit
      .addEventListener('reset', this.#formDeleteClickHandler);

    // const input = this.element.querySelector('.event__input--destination');
    // input.addEventListener('input', () => {
    //   const validOption = getDestinationsNames().some((option) => option === input.value);
    //   if (!validOption) {
    //     input.setCustomValidity('Please select a valid fruit from the list.');
    //   } else {
    //     input.setCustomValidity('');
    //     console.log(1);
    //   }
    // });

    const dests = this.element.querySelectorAll('.event__input--destination');
    for (const dest of dests) {
      dest.addEventListener('change', this.#destChangeHandler);
    }

    const container = this.element.querySelector('.event__section--offers');
    const checkboxes = container.querySelectorAll('.event__offer-checkbox');
    for (const checkbox of checkboxes) {
      checkbox.addEventListener('click', this.#offerClickHandler);
    }

    this.#setDatepickerFrom();
    this.#setDatepickerTo();
  }

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(this._state.point);
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      point: {
        ...this._state.point,
        basePrice: evt.target.valueAsNumber
      }
    });
  };

  #setDatepickerFrom() {
    const startTimeInput = this.element.querySelector('#event-start-time-1');
    this.#datepickerFrom = flatpickr(
      startTimeInput,
      {
        'time_24hr': true,
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.point.dateFrom,
        onClose: this.#dateFromChangeHandler, // На событие flatpickr передаём наш колбэк
        maxDate: this._state.point.dateTo,
      },
    );
  }

  #setDatepickerTo() {
    const endTimeInput = this.element.querySelector('#event-end-time-1');
    this.#datepickerTo = flatpickr(
      endTimeInput,
      {
        'time_24hr': true,
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.point.dateTo,
        onClose: this.#dateToChangeHandler, // На событие flatpickr передаём наш колбэк
        minDate: this._state.point.dateFrom,
      },
    );
  }

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateFrom: userDate
      }
    });
    this.#datepickerTo.set('minDate', this._state.point.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateTo: userDate
      }
    });
    this.#datepickerFrom.set('maxDate', this._state.point.dateTo);
  };

  #destChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      point: {
        ...this._state.point,
        destination: findDestinationId(evt.target.value).id
      }
    });
  };

  #offerClickHandler = (evt) => {
    evt.preventDefault();
    const value = evt.target.value;
    let offersCopy = [...this._state.point.offers];
    if (evt.target.checked) {
      if (!offersCopy.includes(value)) {
        offersCopy.push(value);
      }
    } else {
      offersCopy = offersCopy.filter((item) => item !== value);
    }
    this.updateElement({
      point: {
        ...this._state.point,
        offers: offersCopy
      }
    });
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offers: findOffersByType(evt.target.value)
      }
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    // console.log(getDestinationsNames(), getDestinationNameById(this._state.point.destination));
    // if (!getDestinationsNames().includes(this._state.point.destination)) {
    //   alert('Wrong input!');
    //   return;
    // }
    this.#handleFormSubmit(this._state.point);
  };

  #buttonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleButtonClick();
  };

  reset(point) {
    this.updateElement(
      EditPointView.parsePointToState({ point }),
    );
  }

  static parsePointToState = ({ point }) => ({ point });

  static parseStateToPoint = (state) => state.point;

}
