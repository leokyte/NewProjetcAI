import I18n from '../i18n/i18n';

const { today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth, thisYear, lastYear, last30Days } = I18n.t('periodTypes');


export const Period = {
  LAST_30_DAYS: 'last_30_days',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  items: {
    last30days: { type: 'period', period: 'last_30_days', description: last30Days, subtract: true, premium: true },
    today: { type: 'day', period: 'today', description: today, premium: false },
    yesterday: { type: 'day', period: 'yesterday', description: yesterday, subtract: true, premium: false },
    thisWeek: { type: 'week', period: 'this_week', description: thisWeek, premium: true },
    lastWeek: { type: 'week', period: 'last_week', description: lastWeek, subtract: true, premium: true },
    thisMonth: { type: 'month', period: 'this_month', description: thisMonth, premium: true },
    lastMonth: { type: 'month', period: 'last_month', description: lastMonth, subtract: true, premium: true },
    thisYear: { type: 'year', period: 'this_year', description: thisYear, premium: true },
    lastYear: { type: 'year', period: 'last_year', description: lastYear, subtract: true, premium: true }
  }
};
