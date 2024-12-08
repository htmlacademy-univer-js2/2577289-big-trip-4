import dayjs from 'dayjs';

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

export {humanizePointDate, sortDateDown, sortPriceDown, sortTimeDown};
