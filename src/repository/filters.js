import moment from 'moment/min/moment-with-locales';

import { Period } from '../enums';

export const filterByPeriod = (property, period) => {
  const periods = [
    { type: Period.TODAY, start: moment().startOf('day').subtract(0, 'day') },
    { type: Period.YESTERDAY, start: moment().startOf('day').subtract(1, 'day'), end: moment().startOf('day').subtract(1, 'day') },
    { type: Period.THIS_WEEK, start: moment().startOf('day').weekday(0), end: moment().startOf('d').weekday(6) },
    { type: Period.LAST_WEEK, start: moment().startOf('day').subtract(1, 'week').weekday(0), end: moment().startOf('day').subtract(1, 'week').weekday(6) },
    { type: Period.THIS_MONTH, start: moment().startOf('month'), end: moment().endOf('month') },
    { type: Period.LAST_MONTH, start: moment().subtract(1, 'month').startOf('month'), end: moment().subtract(1, 'month').endOf('month') },
    { type: Period.THIS_YEAR, start: moment().startOf('year'), end: moment().endOf('year') },
    { type: Period.LAST_YEAR, start: moment().subtract(1, 'y').startOf('year'), end: moment().subtract(1, 'y').endOf('year') },
    { type: Period.LAST_30_DAYS, start: moment().subtract(30, 'day') },
  ];

  const selectedPeriod = periods.find(p => p.type === period);
  const startDay = dateInt(selectedPeriod.start);
  const endDay = selectedPeriod.end ? dateInt(selectedPeriod.end) : null;

  let searchString = `${property} >= ${startDay}`;
  if (endDay) searchString += ` AND ${property} <= ${endDay}`;
  return searchString;
};

export const filterByDays = (property, start, end) => {
  const startDay = dateInt(start);
  const endDay = dateInt(end);
  return `${property} >= ${startDay} AND ${property} <= ${endDay}`;
};

const dateInt = (date) => {
  return parseInt(moment(date).locale('en').format('YYYYMMDD'));
  // locale('en') means numbers in 'regular' chars. Avoiding arabic characters.
};
