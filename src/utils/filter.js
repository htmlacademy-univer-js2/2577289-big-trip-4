import { FilterType } from '../const';
import dayjs from 'dayjs';

function isPointFuture(point) {
  return dayjs() < dayjs(point.dateFrom);
}

function isPointPresent(point) {
  return dayjs().date === dayjs(point.dateFrom).date;
}

function isPointPast(point) {
  return dayjs() > dayjs(point.dateFrom);
}

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point)),
};

export { filter };
