import dayjs from 'dayjs';
import { getRandomArrayElement } from '../utils.js';

const DATE_FORMAT = 'D MMMM';

function humanizePointDate(dueDate) {
  return dueDate ? dayjs(dueDate).format(DATE_FORMAT) : '';
}

function sortDateDown(pointA, pointB) {
  return dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
}

function sortTimeDown(pointA, pointB) {
  const length1 = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));
  const length2 = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom));
  return dayjs(length1).diff(dayjs(length2));
}

function sortPriceDown(pointA, pointB) {
  return pointA.basePrice - pointB.basePrice;
}

function getRandomCity(cities) {
  return getRandomArrayElement(cities).id;
}

function findDestination(destinations, destId) {
  const foundDest = destinations.find((item) => {
    if (item.id === destId) {
      return item;
    }
  });
  return foundDest ? foundDest : [];
}

function findDestinationId(destinations, destName) {
  const foundDest = destinations.find((item) => {
    if (item.name === destName) {
      return item;
    }
  });
  return foundDest ? foundDest : [];
}

function findOfferByType(offers, optionType) {
  return offers.find((item) => {
    if (item.type === optionType) {
      return item;
    }
  }).offers[0];
}

function getOfferById(offers, offerId, type) {
  return offers.find((item) => (item.type === type)).offers.find((offer) => (offer.id === offerId));
}

function findOffersByType(offers, optionType) {
  const foundOption = offers.find((item) => item.type === optionType);
  return foundOption ? foundOption.offers : [];
}

function findSpecialOffer(optionType) {
  return findOfferByType(optionType).title;
}

function getOffers(offersId, type) {
  const offersAll = findOffersByType(type);
  const foundOffers = [];
  for (const offer of offersAll) {
    if (offersId.includes(offer.id)) {
      foundOffers.push(offer);
    }
  }
  return foundOffers;
}

function getEmptyPoint(destinations) {
  const emptyPoint = {
    basePrice: 0,
    dateFrom: '2024-01-01T00:00:00Z',
    dateTo: '2025-01-01T00:00:00Z',
    destination: getRandomCity(destinations),
    isFavorite: false,
    offers: [],
    type: 'taxi',
  };
  return emptyPoint;
}

function getDestinationsNames(destinations) {
  return destinations.map((dest) => dest.name);
}

function getRandomDest(destinations) {
  return getRandomArrayElement(destinations);
}

function getDestinationNameById(destinations, destId) {
  return destinations.find((item) => item.id === destId).name;
}

function getOfferPrice(offers, typeName, offerId) {
  return offers.find((item) => item.type === typeName).offers.find((offer) => offer.id === offerId).price;
}

export {
  findDestination, findSpecialOffer, getRandomCity, getOffers,
  getEmptyPoint, findOffersByType, findDestinationId, getDestinationsNames,
  getDestinationNameById, getOfferPrice, getOfferById, getRandomDest,
  humanizePointDate, sortDateDown, sortPriceDown, sortTimeDown
};
