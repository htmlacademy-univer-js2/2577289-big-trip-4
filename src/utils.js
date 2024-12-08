import dayjs from 'dayjs';

const DATE_FORMAT = 'D MMMM';

function humanizePointDate(dueDate) {
  return dueDate ? dayjs(dueDate).format(DATE_FORMAT) : '';
}

function getDateDifference(date1, date2) {
  const startDate = dayjs(date1);
  const endDate = dayjs(date2);

  const diffInMilliseconds = endDate.diff(startDate);

  const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} days ${hours} hours ${minutes} minutes`;
}

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomPicture() {
  return `https://loremflickr.com/248/152?random=${ Math.floor(Math.random() * 1000)}`;
}

export {getRandomArrayElement, humanizePointDate, getRandomPicture, getDateDifference};
