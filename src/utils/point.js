import dayjs from 'dayjs';
import { CITIES } from '../const.js';
import { mockPoints, mockDestination, mockOptions, emptyPoint } from '../mock/point.js';
import { nanoid } from 'nanoid';
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


function getRandomCity() {
  return getRandomArrayElement(CITIES);
}

function getRandomPoint() {
  return {
    id: nanoid(),
    ...getRandomArrayElement(mockPoints)
  };
}

function findDestination(destId) {
  const foundDest = mockDestination.find((item) => {
    if (item.id === destId) {
      return item;
    }
  });
  return foundDest ? foundDest : [];
}

function findDestinationId(destName) {
  const foundDest = mockDestination.find((item) => {
    if (item.name === destName) {
      return item;
    }
  });
  return foundDest ? foundDest : [];
}

function findOfferByType(optionType) {
  return mockOptions.find((item) => {
    if (item.type === optionType) {
      return item;
    }
  }).offers[0];
}

function getOfferById(offerId, type) {
  return mockOptions.find((item) => (item.type === type)).offers.find((offer) => (offer.id === offerId));
}

function findOffersByType(optionType) {
  const foundOption = mockOptions.find((item) => item.type === optionType);
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

function getEmptyPoint() {
  return emptyPoint;
}

function getDestinations() {
  return mockDestination;
}

function getDestinationsNames() {
  return mockDestination.map((dest) => dest.name);
}

function getDestinationNameById(destId) {
  return mockDestination.find((item) => item.id === destId).name;
}

function getOfferPrice(typeName, offerId) {
  return mockOptions.find((item) => item.type === typeName).offers.find((offer) => offer.id === offerId).price;
}

export {
  getRandomPoint, findDestination, findSpecialOffer, getRandomCity, getOffers,
  getEmptyPoint, findOffersByType, getDestinations, findDestinationId, getDestinationsNames,
  getDestinationNameById, getOfferPrice, getOfferById,
  humanizePointDate, sortDateDown, sortPriceDown, sortTimeDown
};
