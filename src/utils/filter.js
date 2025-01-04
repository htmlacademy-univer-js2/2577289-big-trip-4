import { FilterType } from '../const';
import dayjs from 'dayjs';

function isPointFuture(point) {
  return dayjs().isBefore(dayjs(point.dateFrom));
}

function isPointPresent(point) {
  return dayjs().isAfter(dayjs(point.dateFrom)) && dayjs().isBefore(dayjs(point.dateTo));
}

function isPointPast(point) {
  return (dayjs().isAfter(dayjs(point.dateTo)));
}

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point)),
};

export { filter };
