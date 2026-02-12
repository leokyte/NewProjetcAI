import moment from 'moment/min/moment-with-locales';
import { Period } from '../enums';

//
// period - String
//
// days: { start, end }
//

export const formatPeriod = (period, days) => {
  switch (period) {
    case Period.LAST_30_DAYS: {
      return formatDate(moment().subtract(29, 'days'), moment());
    }

    case Period.TODAY: {
      const today = moment();
      return formatDate(today, today);
    }

    case Period.YESTERDAY: {
      const yesterday = moment().subtract(1, 'days');
      return formatDate(yesterday, yesterday);
    }

    case Period.THIS_WEEK: {
      return formatDate(
        moment().startOf('week'),
        moment().endOf('week')
      );
    }

    case Period.LAST_WEEK: {
      return formatDate(
        moment().subtract(1, 'week').startOf('week'),
        moment().subtract(1, 'week').endOf('week')
      );
    }

    case Period.THIS_MONTH: {
      return formatDate(
        moment().startOf('month'),
        moment().endOf('month')
      );
    }

    case Period.LAST_MONTH: {
      return formatDate(
        moment().subtract(1, 'month').startOf('month'),
        moment().subtract(1, 'month').endOf('month')
      );
    }

    case Period.THIS_YEAR: {
      return formatDate(
        moment().startOf('year'),
        moment().endOf('year')
      );
    }

    case Period.LAST_YEAR: {
      return formatDate(
        moment().subtract(1, 'year').startOf('year'),
        moment().subtract(1, 'year').endOf('year')
      );
    }

    // if not period
    default:
      return formatDate(
        moment(days.start || undefined),
        moment(days.end || undefined)
      );
  }
};

const formatDate = (start, end) => {
  const format = (date) => date.format('YYYYMMDD');
  return {
    init: format(start),
    end: format(end)
  };
};
