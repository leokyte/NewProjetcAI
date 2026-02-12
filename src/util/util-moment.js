import moment from 'moment-timezone';

const timezoneDefault = 'Europe/London';

export const momentFirebaseUserProperties = (date) => {
  if (!date) return null;

  const formatedDate = moment(date).tz(timezoneDefault).format('YYYYMMDD');
  return formatedDate;
};
